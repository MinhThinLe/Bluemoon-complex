use std::collections::HashMap;

use http::StatusCode;

use serde::Serialize;

use serde_json::Value;

use warp::reject::{Reject, Rejection};
use warp::reply::{Reply, html, json, with_status};

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

pub enum Apartments {
    Some(Vec<ApartmentId>),
    All,
}

pub struct Fee {
    pub amount: f64,
    pub type_id: FeeTypeId,
    pub for_apartments: Apartments,
    pub optional: bool,
    pub due_on: UnixTime,
}

#[derive(Debug)]
pub enum FeeTypeError {
    NoNameKey,
}

#[derive(Debug)]
pub enum FeeError {
    Amount,
    Designator,
    Type,
    Optional,
    DueDate,
}

impl Reject for FeeError {}

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
    type Error = FeeError;
    fn try_from(value: &Value) -> Result<Self, Self::Error> {
        Ok(match value {
            Value::String(string) if string == "all" => Self::All,
            Value::Array(array) => Self::Some(
                array
                    .iter()
                    .map(|item| item.as_i64().map(|i64| i64.cast_unsigned() as ApartmentId))
                    .collect::<Option<Vec<ApartmentId>>>()
                    .ok_or(FeeError::Designator)?,
            ),
            _other => Err(FeeError::Designator)?,
        })
    }
}

impl TryFrom<Value> for Fee {
    type Error = FeeError;
    fn try_from(value: Value) -> Result<Self, Self::Error> {
        let amount = get_float(&value, "amount").ok_or(FeeError::Amount)?;
        if amount <= 0.0 {
            Err(FeeError::Amount)?;
        }
        let type_id = get_int(&value, "type").ok_or(FeeError::Type)?;
        let optional = get_bool(&value, "optional").ok_or(FeeError::Optional)?;

        let due_on = get_int(&value, "due-on").ok_or(FeeError::DueDate)?;

        let for_apartments = value
            .get("for")
            .ok_or(FeeError::Designator)?
            .try_into()
            .map_err(|_| FeeError::Designator)?;

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

        match self.database.add_fee_type(fee_type).await {
            Ok(()) => Ok(with_status(html("ADD FEE TYPE OK"), StatusCode::OK)),
            Err(_) => Ok(with_status(
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

        let fee_types = self.database.get_all_fee_types().await?;

        Ok(with_status(json(&fee_types), StatusCode::OK))
    }

    pub async fn new_fee_handle(
        self,
        privilege: PrivilegeLevel,
        fee: Result<Fee, FeeError>,
    ) -> Result<impl Reply, Rejection> {
        if privilege < PrivilegeLevel::Admin {
            Err(UnderAuthenticated)?;
        }
        let fee = fee?;

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
                html("Invalid Id list supplied"),
                StatusCode::BAD_REQUEST,
            ));
        }

        self.database
            .get_all_fee_types()
            .await?
            .iter()
            .any(|fee_type| fee_type.id == fee.type_id)
            .ok_or(FeeError::Type)?;

        self.database.add_fee(fee, &apartment_ids).await?;

        Ok(with_status(html("Success"), StatusCode::OK))
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
            .map(|_| with_status(html("Delete OK"), StatusCode::OK))?)
    }
}

fn get_int<T: TryFrom<i64>>(value: &Value, key: &str) -> Option<T> {
    T::try_from(value.get(key)?.as_i64()?).ok()
}

fn get_float<T: TryFrom<f64>>(value: &Value, key: &str) -> Option<T> {
    T::try_from(value.get(key)?.as_f64()?).ok()
}

fn get_bool(value: &Value, key: &str) -> Option<bool> {
    value.get(key)?.as_bool()
}
