use bluemoon_authentication::{PrivilegeLevel, UnderAuthenticated};
use bluemoon_database::{
    ApartmentId, DatabaseError, FeeAdditionRequest, FeeModificationRequest, FeeType, FeeTypeId,
};
use http::StatusCode;
use serde_json::json;
use warp::reject::Rejection;
use warp::reply::{Reply, html, json, with_status};

use crate::server::Server;

// Handlers for the fee / apartment endpoints described in
// backend/docs/api-spec.md.
//
// Handlers that return JSON on success and plain text on failure call
// `.into_response()` so every branch has the same concrete type.

impl Server {
    /// POST /api/new/fee-type  (Admin)
    /// 400 if the fee type name already exists.
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
            return Ok(with_status("Duplicate fee type", StatusCode::BAD_REQUEST));
        }
        self.database.add_fee_type(fee_type).await?;
        Ok(with_status("Add fee type ok", StatusCode::OK))
    }

    /// GET /api/fee-types  (Accountant)
    /// Body: { "fee-types": [{ "id": integer, "name": string }] }
    pub async fn get_fee_types_handle(
        self,
        privilege: PrivilegeLevel,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Accountant {
            Err(UnderAuthenticated)?;
        }
        let fee_types = self.database.get_all_fee_types().await?;
        Ok(with_status(
            json(&json!({ "fee-types": fee_types })),
            StatusCode::OK,
        ))
    }

    /// POST /api/new/fee  (Admin)
    /// 400 if `amount` <= 0, `type` is not a valid fee type id, or `for`
    /// is empty / contains an invalid apartment id.
    pub async fn new_fee_handle(
        self,
        privilege: PrivilegeLevel,
        request: FeeAdditionRequest,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }
        if request.amount <= 0 {
            return Ok(with_status("Invalid amount", StatusCode::BAD_REQUEST));
        }

        let fee_types = self.database.get_all_fee_types().await?;
        if !fee_types.iter().any(|item| item.id == request.type_id) {
            return Ok(with_status("Invalid fee type", StatusCode::BAD_REQUEST));
        }

        match self.database.add_fee(request).await {
            Ok(()) => Ok(with_status("Success", StatusCode::OK)),
            Err(DatabaseError::NoRowsAltered) => Ok(with_status(
                "Invalid apartment id list supplied",
                StatusCode::BAD_REQUEST,
            )),
            Err(error) => Err(error.into()),
        }
    }

    /// DELETE /api/delete/fee/{fee_type_id}  (Admin)
    /// Deletes every fee record of the given fee type.
    /// 404 if the fee type does not exist.
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

        self.database.delete_fees(fee_type_id).await?;
        Ok(with_status(html("Success"), StatusCode::OK))
    }

    /// POST /api/edit/fee  (Admin)
    /// 404 if no record was modified.
    /// 400 if a new `amount` is <= 0 (the Fees table has CHECK (amount > 0),
    /// so without this check SQLite would fail and the client would get a 500).
    pub async fn edit_fee_handle(
        self,
        privilege: PrivilegeLevel,
        request: FeeModificationRequest,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }
        if matches!(request.amount, Some(amount) if amount <= 0) {
            return Ok(with_status("Invalid amount", StatusCode::BAD_REQUEST));
        }

        match self.database.modify_fee(request).await {
            Ok(0) | Err(DatabaseError::NoRowsAltered) => {
                Ok(with_status("No fee was modified", StatusCode::NOT_FOUND))
            }
            Ok(_) => Ok(with_status("Success", StatusCode::OK)),
            Err(error) => Err(error.into()),
        }
    }

    /// GET /api/apartments/{floor}  (Accountant)
    /// 400 if floor is outside 1..=30.
    /// Body: { "apartments": [{ id, area, type-name }] }
    pub async fn get_apartments_handle(
        self,
        privilege: PrivilegeLevel,
        floor: i32,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Accountant {
            Err(UnderAuthenticated)?;
        }
        if !(1..=30).contains(&floor) {
            return Ok(with_status("Invalid floor", StatusCode::BAD_REQUEST).into_response());
        }

        let apartments = self.database.get_apartments(floor).await?;
        Ok(with_status(
            json(&json!({ "apartments": apartments })),
            StatusCode::OK,
        )
        .into_response())
    }

    /// GET /api/fee/apartment/{apartment_id}  (Accountant)
    /// 404 if the apartment does not exist.
    /// Body: { "fees": [{ amount, paid, optional, type-name, created-at, due-on }] }
    pub async fn get_apartment_fees_handle(
        self,
        privilege: PrivilegeLevel,
        apartment_id: ApartmentId,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Accountant {
            Err(UnderAuthenticated)?;
        }
        if !self.database.apartment_exists(apartment_id).await? {
            return Ok(
                with_status("Apartment id doesn't exist", StatusCode::NOT_FOUND).into_response(),
            );
        }

        let fees = self.database.get_apartment_fees(apartment_id).await?;
        Ok(with_status(json(&json!({ "fees": fees })), StatusCode::OK).into_response())
    }
}
