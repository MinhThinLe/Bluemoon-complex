use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use serde_json::Value;

pub type FeeTypeId = i32;
pub type ApartmentId = i32;
pub type UnixTime = i64;

#[derive(Serialize, Deserialize, Debug)]
pub struct FeeType {
    #[serde(skip_deserializing)]
    pub id: FeeTypeId,
    pub(crate) name: String,
}

#[derive(Debug)]
pub enum FeeTypeError {
    NoNameKey,
}

pub struct User {
    pub username: String,
    pub hashed_password: String,
    pub salt: String,
    pub role: String,
}

pub struct FeeAdditionRequest {
    pub amount: i64,
    pub type_id: FeeTypeId,
    pub for_apartments: Apartments,
    pub optional: bool,
    pub due_on: UnixTime,
}

#[derive(Debug)]
pub enum FeeAdditionError {
    Amount,
    Designator,
    Type,
    Optional,
    DueDate,
}

#[derive(Deserialize, Debug)]
pub struct FeeModificationRequest {
    #[serde(rename = "id")]
    pub type_id: FeeTypeId,
    pub apartment_id: ApartmentId,
    pub paid: Option<bool>,
    pub optional: Option<bool>,
    pub amount: Option<i64>,
}

pub enum Apartments {
    Some(Vec<ApartmentId>),
    All,
}

#[derive(Serialize, Debug)]
pub struct Apartment {
    pub id: ApartmentId,
    pub area: f32,
    pub type_name: String,
}

pub struct DatabaseConfig {
    pub(crate) path: PathBuf,
}

#[derive(Serialize)]
pub struct Fee {
    pub amount: i64,
    pub paid: bool,
    pub optional: bool,
    pub type_name: String,
    pub created_at: UnixTime,
    pub due_on: UnixTime,
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

impl DatabaseConfig {
    pub fn new(path: PathBuf) -> Self {
        Self { path }
    }
}

impl FeeAdditionError {
    pub fn rejection_message(self) -> String {
        let message = match self {
            Self::Amount => "amount",
            Self::Designator => "designator",
            Self::Type => "type",
            Self::Optional => "optional",
            Self::DueDate => "due date",
        };

        format!("Invalid {message}")
    }
}

fn get_int<T: TryFrom<i64>>(value: &Value, key: &str) -> Option<T> {
    T::try_from(value.get(key)?.as_i64()?).ok()
}

fn get_bool(value: &Value, key: &str) -> Option<bool> {
    value.get(key)?.as_bool()
}
