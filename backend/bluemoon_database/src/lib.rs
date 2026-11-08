mod database;
mod tables;

pub use database::{Database, DatabaseError};
pub use tables::{
    ApartmentId, Apartments, DatabaseConfig, FeeAdditionError, FeeAdditionRequest,
    FeeModificationError, FeeModificationRequest, FeeType, FeeTypeError, FeeTypeId, User,
};
