use std::convert::Infallible;
use std::future::ready;

use http::StatusCode;

use warp::filters::cookie::cookie;
use warp::filters::header::header;
use warp::filters::method;
use warp::reject::Rejection;
use warp::reply::{Reply, html, with_header, with_status};
use warp::{Filter, path};

use crate::authentication::{
    AuthenticatedUsers, AuthenticationToken, NoSessionToken, PrivilegeLevel,
};
use crate::config::ServerConfig;
use crate::database::Database;

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
            .protected_hello()
            .or(self.clone().process_authentication())
            .or(self.request_authentication())
    }

    fn protected_hello(
        self,
    ) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        method::get()
            .and(path!("hello"))
            .and(self.clone().inject())
            .and(self.clone().auth_token())
            .and_then(Self::protected_hello_handle)
    }

    fn process_authentication(
        self,
    ) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        header::<String>("Authorization")
            .and(self.inject())
            .and_then(|item, server: Server| server.process_authentication_handle(item))
    }

    fn request_authentication(
        self,
    ) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        path!("hello")
            .and(self.inject())
            .and_then(Self::request_authentication_handle)
    }

    async fn request_authentication_handle(self) -> Result<impl Reply, Infallible> {
        let reply_content = html("SIGN IN");
        let reply = with_status(reply_content, StatusCode::UNAUTHORIZED);
        let reply = with_header(reply, "WWW-Authenticate", "Basic, charset=\"UTF-8\"");

        ready(Ok(reply)).await
    }

    async fn protected_hello_handle(
        self,
        _privilege: PrivilegeLevel,
    ) -> Result<impl Reply, Infallible> {
        ready(Ok(warp::reply::html("Protected Hello world"))).await
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
