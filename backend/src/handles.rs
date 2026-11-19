use bluemoon_authentication::{PrivilegeLevel, UnderAuthenticated};
use bluemoon_database::{
    ApartmentId, DatabaseError, FeeAdditionRequest, FeeModificationRequest, FeeType, FeeTypeId,
};
use http::StatusCode;
use serde_json::json;
use warp::reject::Rejection;
use warp::reply::{Reply, html, json, with_status};

use crate::server::Server;

impl Server {
    /// POST /api/new/fee-type
    /// Only Admin users can create a fee type.
    pub async fn new_fee_type_handle(
        self,
        privilege: PrivilegeLevel,
        fee_type: FeeType,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }

        let fee_types = self.database.get_all_fee_types().await?;
        if fee_types.iter().any(|item| item.name == fee_type.name) {
            return Ok(with_status(
                "Duplicate fee type",
                StatusCode::BAD_REQUEST,
            ));
        }

        self.database.add_fee_type(fee_type).await?;
        Ok(with_status("Add fee type ok", StatusCode::OK))
    }

    /// GET /api/fee-types
    /// Accountant and Admin users can view all fee types.
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

    /// POST /api/new/fee
    /// Creates a fee for the apartments specified in the request.
    /// If `for` is omitted, the database layer applies the fee to all apartments.
    pub async fn new_fee_handle(
        self,
        privilege: PrivilegeLevel,
        request: FeeAdditionRequest,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }

        if request.amount <= 0 {
            return Ok(with_status(
                "Invalid amount",
                StatusCode::BAD_REQUEST,
            ));
        }

        match self.database.add_fee(request).await {
            Ok(()) => Ok(with_status("Success", StatusCode::OK)),
            Err(DatabaseError::NoRowsAltered) => Ok(with_status(
                "Invalid apartment id list supplied",
                StatusCode::NOT_FOUND,
            )),
            Err(error) => Err(error.into()),
        }
    }

    /// DELETE /api/delete/fee/{fee_type_id}
    /// Deletes fee records belonging to the specified fee type.
    pub async fn delete_fee_handle(
        self,
        privilege: PrivilegeLevel,
        fee_type_id: FeeTypeId,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }

        let fee_types = self.database.get_all_fee_types().await?;
        if !fee_types.iter().any(|fee_type| fee_type.id == fee_type_id) {
            return Ok(with_status(
                html("Fee type id doesn't exist"),
                StatusCode::NOT_FOUND,
            ));
        }