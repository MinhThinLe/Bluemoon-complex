use std::collections::HashMap;

use http::StatusCode;

use serde::Serialize;

use serde_json::Value;

use warp::reject::Rejection;
use warp::reply::{Html, Reply, html, json, with_status};

use crate::Server;
use crate::authentication::{PrivilegeLevel, UnderAuthenticated};

pub type ApartmentId = u32;
pub type UnixTime = i64;
pub type FeeTypeId = u32;

#[derive(Serialize)]
pub struct FeeType {
    pub id: FeeTypeId,
    pub name: String,
}

#[derive(Debug)]
pub enum FeeTypeError {
    NoNameKey,
}

pub struct FeeAdditionRequest {
    pub amount: i64,
    pub type_id: FeeTypeId,
    pub for_apartments: Apartments,
    pub optional: bool,
    pub due_on: UnixTime,
}

pub enum Apartments {
    Some(Vec<ApartmentId>),
    All,
}

#[derive(Debug)]
pub enum FeeAdditionError {
    Amount,
    Designator,
    Type,
    Optional,
    DueDate,
}

pub struct FeeModificationRequest {
    pub type_id: FeeTypeId,
    pub apartment_id: ApartmentId,
    pub paid: Option<bool>,
    pub optional: Option<bool>,
    pub amount: Option<i64>,
}

#[derive(Debug)]
pub enum FeeModificationError {
    TypeId,
    ApartmentId,
    Amount,
}

impl TryFrom<&Value> for FeeModificationRequest {
    type Error = FeeModificationError;
    fn try_from(value: &Value) -> Result<Self, Self::Error> {
        let type_id = get_int(value, "id").ok_or(FeeModificationError::TypeId)?;
        let apartment_id =
            get_int(value, "apartment_id").ok_or(FeeModificationError::ApartmentId)?;

        let paid = get_bool(value, "paid");
        let optional = get_bool(value, "optional");
        let amount = get_int(value, "amount");

        // Using a u64 from the get go would have made this check redundant but relational databases
        // (or at the very least, Sqlite and Postgres) in general doesn't offer unsigned integers as
        // a data structure for some reason. This check looks rather silly, deal with it.
        if let Some(amount) = amount
            && amount < 0
        {
            Err(FeeModificationError::Amount)?;
        }

        Ok(Self {
            type_id,
            apartment_id,
            paid,
            optional,
            amount,
        })
    }
}

impl TryFrom<HashMap<String, String>> for FeeType {
    type Error = FeeTypeError;
    fn try_from(value: HashMap<String, String>) -> Result<Self, Self::Error> {
        let name = value.get("name").ok_or(FeeTypeError::NoNameKey)?;

        Ok(Self {
            id: 0,
            name: name.clone(),
        })
    }
}

impl TryFrom<&Value> for Apartments {
    type Error = FeeAdditionError;
    fn try_from(value: &Value) -> Result<Self, Self::Error> {
        Ok(match value {
            Value::String(string) if string == "all" => Self::All,
            Value::Array(array) => Self::Some(
                array
                    .iter()
                    .map(|item| item.as_i64().map(|i64| i64.cast_unsigned() as ApartmentId))
                    .collect::<Option<Vec<ApartmentId>>>()
                    .ok_or(FeeAdditionError::Designator)?,
            ),
            _other => Err(FeeAdditionError::Designator)?,
        })
    }
}

impl TryFrom<Value> for FeeAdditionRequest {
    type Error = FeeAdditionError;
    fn try_from(value: Value) -> Result<Self, Self::Error> {
        let amount = get_int(&value, "amount").ok_or(FeeAdditionError::Amount)?;
        // Using an i64 to exclusively store positive values sounds rather silly because it IS
        // silly. The reason for such tomfoolery is that relational databases in general do not
        // offer support for unsigned integers as a data structure. This is insanely silly, deal
        // with it.
        if amount < 0 {
            Err(FeeAdditionError::Amount)?;
        }
        let type_id = get_int(&value, "type").ok_or(FeeAdditionError::Type)?;
        let optional = get_bool(&value, "optional").ok_or(FeeAdditionError::Optional)?;

        let due_on = get_int(&value, "due-on").ok_or(FeeAdditionError::DueDate)?;

        let for_apartments = value
            .get("for")
            .ok_or(FeeAdditionError::Designator)?
            .try_into()
            .map_err(|_| FeeAdditionError::Designator)?;

        Ok(Self {
            amount,
            type_id,
            for_apartments,
            optional,
            due_on,
        })
    }
}

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
                html("Invalid Id list supplied".to_string()),
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
                html("Invalid Id supplied".to_string()),
                StatusCode::BAD_REQUEST,
            ));
        };

        self.database.add_fee(fee, &apartment_ids).await?;

        Ok(with_status(html("Success".to_string()), StatusCode::OK))
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
            .map(|()| with_status(html("Modify OK".to_string()), StatusCode::OK))?)
    }
}

impl FeeAdditionError {
    fn rejection_message(self) -> Html<String> {
        let message = match self {
            Self::Amount => "amount",
            Self::Designator => "designator",
            Self::Type => "type",
            Self::Optional => "optional",
            Self::DueDate => "due date",
        };

        html(format!("Invalid {message}"))
    }
}

impl FeeModificationError {
    fn rejection_message(self) -> Html<String> {
        let message = match self {
            Self::TypeId => "type id",
            Self::ApartmentId => "apartment id",
            Self::Amount => "amount",
        };

        html(format!("Invalid {message}"))
    }
}

fn get_int<T: TryFrom<i64>>(value: &Value, key: &str) -> Option<T> {
    T::try_from(value.get(key)?.as_i64()?).ok()
}

fn get_bool(value: &Value, key: &str) -> Option<bool> {
    value.get(key)?.as_bool()
}
