use std::convert::Infallible;
use std::future::ready;

use bluemoon_authentication::{
    AuthenticatedUsers, AuthenticationToken, NoSessionToken, PrivilegeLevel, UnderAuthenticated,
};
use http::StatusCode;

use warp::filters::cookie::cookie;
use warp::filters::header::header;
use warp::filters::method;
use warp::reject::Rejection;
use warp::reply::{Reply, html, with_header, with_status};
use warp::{Filter, path};

use bluemoon_database::{
    Database, DatabaseError, FeeAdditionRequest, FeeModificationRequest, FeeType, FeeTypeId,
};

use crate::config::ServerConfig;

const API_ROOT_URL: &str = "api";

#[derive(Clone)]
pub struct Server {
    config: ServerConfig,
    pub database: Database,
    pub users: AuthenticatedUsers,
}

impl Server {
    pub fn new(config: ServerConfig, database: Database) -> Self {
        Self {
            config,
            database,
            users: AuthenticatedUsers::new(),
        }
    }

    pub async fn serve(self) {
        warp::serve(self.clone().end_points())
            .run(self.config.listen_address)
            .await;
    }

    fn end_points(self) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        self.clone()
            .new_fee_type()
            .or(self.clone().get_fee_types())
            .or(self.clone().new_fee())
            .or(self.clone().delete_fee())
            .or(self.clone().edit_fee())
            .or(self.clone().get_apartments())
            .or(self.clone().get_apartment_fees())
            .or(self.clone().process_authentication())
            .or(self.request_authentication())
    }

    fn get_apartments(self) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        method::get()
            .and(path(API_ROOT_URL))
            .and(path!("apartments" / i32))
            .and(self.clone().inject())
            .and(self.clone().auth_token())
            .and_then(|floor, server: Server, privilege_level| {
                server.get_apartments_handle(privilege_level, floor)
            })
            .recover(handle_rejection)
    }

    fn get_apartment_fees(self) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        method::get()
            .and(path(API_ROOT_URL))
            .and(path!("fee" / "apartment" / i32))
            .and(self.clone().inject())
            .and(self.clone().auth_token())
            .and_then(|id, server: Server, privilege_level| {
                server.get_apartment_fees_handle(privilege_level, id)
            })
            .recover(handle_rejection)
    }

    fn delete_fee(self) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        method::delete()
            .and(path(API_ROOT_URL))
            .and(path!("delete" / "fee" / FeeTypeId))
            .and(self.clone().inject())
            .and(self.clone().auth_token())
            .and_then(|fee_type_id, server: Server, privilege_level| {
                server.delete_fee_handle(privilege_level, fee_type_id)
            })
            .recover(handle_rejection)
    }

    fn new_fee_type(self) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        method::post()
            .and(path(API_ROOT_URL))
            .and(path!("new" / "fee-type"))
            .and(warp::body::content_length_limit(1024))
            .and(warp::body::json::<FeeType>())
            .and(self.clone().inject())
            .and(self.clone().auth_token())
            .and_then(|fee_type, server: Server, privilege_level| {
                server.new_fee_type_handle(privilege_level, fee_type)
            })
            .recover(handle_rejection)
    }

    fn get_fee_types(self) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        method::get()
            .and(path(API_ROOT_URL))
            .and(path!("fee-types"))
            .and(self.clone().inject())
            .and(self.clone().auth_token())
            .and_then(Self::get_fee_types_handle)
            .recover(handle_rejection)
    }

    fn new_fee(self) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        method::post()
            .and(path(API_ROOT_URL))
            .and(path!("new" / "fee"))
            .and(warp::body::content_length_limit(1024))
            .and(warp::body::json::<FeeAdditionRequest>())
            .and(self.clone().inject())
            .and(self.clone().auth_token())
            .and_then(|fee, server: Server, token| server.new_fee_handle(token, fee))
            .recover(handle_rejection)
    }

    fn edit_fee(self) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        method::post()
            .and(path(API_ROOT_URL))
            .and(path!("edit" / "fee"))
            .and(warp::body::content_length_limit(1024))
            .and(warp::body::json::<FeeModificationRequest>())
            .and(self.clone().inject())
            .and(self.clone().auth_token())
            .and_then(|request, server: Server, privilege_level| {
                server.edit_fee_handle(privilege_level, request)
            })
            .recover(handle_rejection)
    }

    fn process_authentication(
        self,
    ) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        header::<String>("Authorization")
            .and(self.inject())
            .and_then(|item, server: Server| {
                server
                    .users
                    .process_authentication_handle(item, server.database)
            })
    }

    fn request_authentication(
        self,
    ) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        self.inject().and_then(Self::request_authentication_handle)
    }

    async fn request_authentication_handle(self) -> Result<impl Reply, Rejection> {
        let reply_content = html("SIGN IN");
        let reply = with_status(reply_content, StatusCode::UNAUTHORIZED);
        let reply = with_header(reply, "WWW-Authenticate", "Basic, charset=\"UTF-8\"");

        ready(Ok(reply)).await
    }

    fn auth_token(self) -> impl Filter<Extract = (PrivilegeLevel,), Error = Rejection> + Clone {
        self.inject()
            .and(cookie("Session-Token"))
            .and_then(Self::extract_token)
    }

    fn inject(self) -> impl Filter<Extract = (Self,), Error = Infallible> + Clone {
        warp::any().map(move || self.clone())
    }

    async fn extract_token(self, token: String) -> Result<PrivilegeLevel, Rejection> {
        self.users
            .authenticated_as(AuthenticationToken::new(&token))
            .await
            .ok_or_else(|| Rejection::from(NoSessionToken))
    }
}

async fn handle_rejection(err: Rejection) -> Result<impl Reply, Rejection> {
    use log::{error, warn};
    use warp::reject::MethodNotAllowed;

    if err.is_not_found() {
        return Err(err);
    }
    if err.find::<MethodNotAllowed>().is_some() {
        return Err(err);
    }

    if let Some(db_err) = err.find::<DatabaseError>() {
        error!("Database error: {db_err:?}");
        return Ok(with_status(
            html("Database error"),
            StatusCode::INTERNAL_SERVER_ERROR,
        ));
    }
    if err.find::<UnderAuthenticated>().is_some() {
        return Ok(with_status(
            html("Under-authenticated"),
            StatusCode::FORBIDDEN,
        ));
    }

    warn!("Unhandled rejection: {err:?}");
    Err(err)
}
