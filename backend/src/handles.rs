use std::collections::HashMap;

use http::StatusCode;

use serde::Serialize;

use serde_json::json;

use warp::reject::{Reject, Rejection};
use warp::reply::{Reply, html, json, with_status};

use crate::Server;
use crate::authentication::{PrivilegeLevel, UnderAuthenticated};

#[derive(Serialize)]
pub struct FeeType {
    pub id: u32,
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

        Ok(Self {
            id: 0,
            name: name.clone(),
        })
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

    pub async fn get_fee_types_handle(
        self,
        privilege: PrivilegeLevel,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Accountant {
            Err(UnderAuthenticated)?;
        }

        let Ok(fee_types) = self.database.get_all_fee_types().await else {
            return Ok(with_status(
                json(&json!({ "error": "Failed to query the database" })),
                StatusCode::INTERNAL_SERVER_ERROR,
            ));
        };

        Ok(with_status(json(&fee_types), StatusCode::OK))
    }
}
