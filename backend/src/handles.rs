use std::collections::HashMap;

use http::StatusCode;
use warp::reject::{Reject, Rejection};
use warp::reply::{Reply, html, with_status};

use crate::Server;
use crate::authentication::{PrivilegeLevel, UnderAuthenticated};

pub struct FeeType {
    pub name: String,
}

#[derive(Debug)]
enum InvalidFeeType {
    NoNameKey,
}

impl Reject for InvalidFeeType {}

impl TryFrom<HashMap<String, String>> for FeeType {
    type Error = Rejection;
    fn try_from(value: HashMap<String, String>) -> Result<Self, Self::Error> {
        let name = value.get("name").ok_or(InvalidFeeType::NoNameKey)?;

        Ok(Self { name: name.clone() })
    }
}

impl Server {
    pub async fn new_fee_type_handle(
        self,
        privilege: PrivilegeLevel,
        fee_type: Result<FeeType, Rejection>,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }
        let Ok(fee_type) = fee_type else {
            return Ok(with_status(html("INVALID JSON"), StatusCode::BAD_REQUEST));
        };

        match self.database.add_fee_type(fee_type).await {
            Ok(()) => Ok(with_status(html("ADD FEE TYPE OK"), StatusCode::OK)),
            Err(()) => Ok(with_status(
                html("DUPLICATE FEE TYPE"),
                StatusCode::BAD_REQUEST,
            )),
        }
    }
}
