use std::path::PathBuf;

use serde::{Deserialize, Serialize};

pub type FeeTypeId = i32;
pub type ApartmentId = i32;
pub type UnixTime = i64;

#[derive(Serialize, Deserialize, Debug)]
pub struct FeeType {
    #[serde(skip_deserializing)]
    pub id: FeeTypeId,
    pub name: String,
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

#[derive(Deserialize, Debug)]
pub struct FeeAdditionRequest {
    pub amount: i64,
    #[serde(rename = "for")]
    pub for_apartments: Option<Vec<ApartmentId>>,
    #[serde(rename = "type")]
    pub type_id: FeeTypeId,
    pub optional: bool,
    #[serde(rename = "due-on")]
    pub due_on: UnixTime,
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

impl DatabaseConfig {
    #[must_use]
    pub fn new(path: PathBuf) -> Self {
        Self { path }
    }
}
