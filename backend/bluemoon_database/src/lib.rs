mod database;
mod tables;

pub use database::{Database, DatabaseError};
pub use tables::{
    Apartments, DatabaseConfig, FeeAdditionError, FeeAdditionRequest, FeeModificationError,
    FeeModificationRequest, FeeType, FeeTypeError, FeeTypeId, PrivilegeLevel, User,
};
