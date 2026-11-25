use http::StatusCode;

use serde_json::json;
use warp::reject::Rejection;
use warp::reply::{Reply, html, json, with_status};

use bluemoon_authentication::{PrivilegeLevel, UnderAuthenticated};
use bluemoon_database::{
    ApartmentId, DatabaseError, FeeAdditionRequest, FeeModificationRequest, FeeType, FeeTypeId,
};

use crate::Server;

impl Server {
    pub async fn new_fee_type_handle(
        self,
        privilege: PrivilegeLevel,
        fee_type: FeeType,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }

        Ok(self
            .database
            .add_fee_type(fee_type)
            .await
            .map(|()| with_status("Add fee type ok", StatusCode::OK))?)
    }

    pub async fn get_fee_types_handle(
        self,
        privilege: PrivilegeLevel,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Accountant {
            Err(UnderAuthenticated)?;
        }

        let fee_types = self.database.get_all_fee_types().await?;

        Ok(with_status(json(&fee_types), StatusCode::OK))
    }

    pub async fn new_fee_handle(
        self,
        privilege: PrivilegeLevel,
        request: FeeAdditionRequest,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }

        Ok(match self.database.add_fee(request).await {
            Ok(()) => with_status("Success", StatusCode::OK),
            Err(DatabaseError::NoRowsAltered) => {
                with_status("Invalid apartment id list supplied", StatusCode::NOT_FOUND)
            }
            Err(other) => Err(other)?,
        })
    }

    pub async fn delete_fee_handle(
        self,
        privilege: PrivilegeLevel,
        fee_type_id: FeeTypeId,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }

        Ok(self
            .database
            .delete_fees(fee_type_id)
            .await
            .map(|()| with_status(html("Delete OK"), StatusCode::OK))?)
    }

    pub async fn edit_fee_handle(
        self,
        privilege: PrivilegeLevel,
        request: FeeModificationRequest,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }

        self.database.modify_fee(request).await?;
        Ok(with_status("Modify OK", StatusCode::OK))
    }

    pub async fn get_apartments_handle(
        self,
        privilege: PrivilegeLevel,
        floor: i32,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Accountant {
            Err(UnderAuthenticated)?;
        }

        Ok(self
            .database
            .get_apartments(floor)
            .await
            .map(|content| with_status(json(&json!({ "apartments" : content})), StatusCode::OK))?)
    }

    pub async fn get_apartment_fees_handle(
        self,
        privilege: PrivilegeLevel,
        apartment_id: ApartmentId,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Accountant {
            Err(UnderAuthenticated)?;
        }

        let content = self.database.get_apartment_fees(apartment_id).await?;

        Ok(with_status(
            json(&json!({ "fees": content })),
            StatusCode::OK,
        ))
    }
}
