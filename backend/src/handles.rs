use http::StatusCode;

use warp::reject::Rejection;
use warp::reply::{Reply, html, json, with_status};

use bluemoon_database::{
    Apartments, FeeAdditionError, FeeAdditionRequest, FeeModificationError, FeeModificationRequest,
    FeeType, FeeTypeError, FeeTypeId, PrivilegeLevel,
};

use crate::Server;
use crate::authentication::UnderAuthenticated;

impl Server {
    pub async fn new_fee_type_handle(
        self,
        privilege: PrivilegeLevel,
        fee_type: Result<FeeType, FeeTypeError>,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }
        let Ok(fee_type) = fee_type else {
            return Ok(with_status(html("INVALID JSON"), StatusCode::BAD_REQUEST));
        };

        Ok(self
            .database
            .add_fee_type(fee_type)
            .await
            .map(|()| with_status(html("ADD FEE TYPE OK"), StatusCode::OK))?)
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
        fee: Result<FeeAdditionRequest, FeeAdditionError>,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }

        let fee = match fee {
            Ok(fee) => fee,
            Err(error) => {
                return Ok(with_status(
                    error.rejection_message(),
                    StatusCode::BAD_REQUEST,
                ));
            }
        };

        let (apartment_ids, all_ids_valid) = {
            let mut apartment_ids = self.database.get_all_apartment_id().await?;
            let all_ids_valid = match fee.for_apartments {
                Apartments::All => true,
                Apartments::Some(ref ids) => {
                    if ids.iter().all(|id| apartment_ids.contains(id)) {
                        apartment_ids.clone_from(ids);
                        true
                    } else {
                        false
                    }
                }
            };

            (apartment_ids, all_ids_valid)
        };

        if !all_ids_valid {
            return Ok(with_status(
                "Invalid Id list supplied".to_string(),
                StatusCode::BAD_REQUEST,
            ));
        }

        if !self
            .database
            .get_all_fee_types()
            .await?
            .iter()
            .any(|fee_type| fee_type.id == fee.type_id)
        {
            return Ok(with_status(
                "Invalid Id supplied".to_string(),
                StatusCode::BAD_REQUEST,
            ));
        };

        self.database.add_fee(fee, &apartment_ids).await?;

        Ok(with_status("Success".to_string(), StatusCode::OK))
    }

    pub async fn delete_fee_handle(
        self,
        privilege: PrivilegeLevel,
        fee_type_id: FeeTypeId,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }

        if !self
            .database
            .get_all_fee_types()
            .await?
            .iter()
            .any(|fee_type| fee_type.id == fee_type_id)
        {
            return Ok(with_status(
                html("Fee type id doesn't exist"),
                StatusCode::NOT_FOUND,
            ));
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
        request: Result<FeeModificationRequest, FeeModificationError>,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }

        let request = match request {
            Ok(request) => request,
            Err(error) => {
                return Ok(with_status(
                    error.rejection_message(),
                    StatusCode::BAD_REQUEST,
                ));
            }
        };

        Ok(self
            .database
            .modify_fee(request)
            .await
            .map(|()| with_status("Modify OK".to_string(), StatusCode::OK))?)
    }
}
