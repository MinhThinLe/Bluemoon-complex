#![deny(clippy::pedantic, clippy::complexity, clippy::perf)]
#![allow(clippy::cast_possible_truncation)]

mod database;
mod tables;

pub use database::{Database, DatabaseError};
pub use tables::{
    ApartmentId, DatabaseConfig, FeeAdditionRequest, FeeModificationRequest, FeeType, FeeTypeError,
    FeeTypeId, User,
};
