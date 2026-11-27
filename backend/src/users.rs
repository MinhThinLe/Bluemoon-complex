use bluemoon_authentication::{PrivilegeLevel, UnderAuthenticated};
use bluemoon_database::UserAdditionRequest;
use http::StatusCode;
use warp::filters::method;
use warp::reject::Rejection;
use warp::reply::{Reply, with_status};
use warp::{Filter, path};

use crate::server::{API_ROOT_URL, Server, handle_rejection};

impl Server {
    pub fn user_handles(self) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        self.create_user()
    }

    fn create_user(self) -> impl Filter<Extract = (impl Reply,), Error = Rejection> + Clone {
        method::post()
            .and(path(API_ROOT_URL))
            .and(path!("new" / "user"))
            .and(self.clone().inject())
            .and(self.clone().auth_token())
            .and(warp::body::json::<UserAdditionRequest>())
            .and_then(Self::create_user_handle)
            .recover(handle_rejection)
    }

    async fn create_user_handle(
        self,
        privilege: PrivilegeLevel,
        request: UserAdditionRequest,
    ) -> Result<impl Reply, Rejection> {
        if privilege != PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }

        self.database.add_user(request).await?;

        Ok(with_status("Created", StatusCode::CREATED))
    }
}
