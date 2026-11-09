#![deny(clippy::pedantic, clippy::complexity, clippy::perf)]
#![allow(clippy::cast_possible_truncation)]

mod database;
mod tables;

pub use database::{Database, DatabaseError};
pub use tables::{
    ApartmentId, Apartments, DatabaseConfig, FeeAdditionError, FeeAdditionRequest,
    FeeModificationRequest, FeeType, FeeTypeError, FeeTypeId, User,
};
