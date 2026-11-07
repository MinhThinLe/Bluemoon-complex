use std::str::FromStr;
use std::sync::Arc;

use rusqlite::{Connection, Error, params};

use tokio::sync::Mutex;

use warp::reject::Reject;

use crate::authentication::PrivilegeLevel;
use crate::config::DatabaseConfig;
use crate::handles::{ApartmentId, Fee, FeeType, FeeTypeId};

/// A thin wrapper for Rusqlite's Sqlite connection, shareable between threads though only one could
/// read from, write to it at any time.
#[derive(Clone, Debug)]
pub struct Database {
    connection: Arc<Mutex<Connection>>,
}

#[derive(Debug)]
#[allow(
    dead_code,
    reason = "So that warp can warn against database errors in the console"
)]
pub struct DatabaseError(Error);

impl Reject for DatabaseError {}

impl From<Error> for DatabaseError {
    fn from(value: Error) -> Self {
        Self(value)
    }
}

pub struct User {
    pub username: String,
    pub hashed_password: String,
    pub salt: String,
    pub role: PrivilegeLevel,
}

const INIT_TABLES: &str = include_str!("../sql/init_tables.sql");
const INIT_ROLES: &str = include_str!("../sql/init_roles.sql");

impl Database {
    pub fn new(config: &DatabaseConfig) -> Result<Self, String> {
        let connection = match Connection::open(&config.path) {
            Ok(connection) => connection,
            Err(message) => return Err(message.to_string()),
        };

        create_tables(&connection);

        Ok(Self {
            connection: Arc::new(Mutex::new(connection)),
        })
    }

    pub async fn add_admin_users(&self, users: &[User]) {
        const INSERT_QUERY: &str = "
            INSERT OR IGNORE INTO Users (username, display_name, hashed_password, salt, role_id) values (?, ?, ?, ?, ?);
            ";

        let database = self.connection.lock().await;
        let admin_role_id: u32 = database
            .query_one("SELECT id FROM Roles WHERE name = 'admin'", (), |row| {
                row.get(0)
            })
            .expect("No admin id");

        let mut statement = database.prepare(INSERT_QUERY).expect("Invalid SQL");
        for user in users {
            statement
                .execute((
                    user.username.clone(),
                    user.username.clone(),
                    user.hashed_password.clone(),
                    "",
                    admin_role_id,
                ))
                .expect("Failed to add an admin");
        }
    }

    pub async fn get_user(&self, username: &str) -> Option<User> {
        const QUERY: &str = "select username, hashed_password, salt, Roles.name from Users join Roles on Roles.id = Users.role_id where username = (?);";

        let database = self.connection.lock().await;

        let mut query = database.prepare(QUERY).expect("Invalid SQL");
        query
            .query_one(params![username], |row| {
                Ok(User {
                    username: row.get(0)?,
                    hashed_password: row.get(1)?,
                    salt: row.get(2)?,
                    role: PrivilegeLevel::from_str(&row.get::<_, String>(3)?)
                        .expect("Invalid previledge stored in database"),
                })
            })
            .ok()
    }

    pub async fn add_fee_type(&self, fee_type: FeeType) -> Result<(), DatabaseError> {
        const QUERY: &str = "insert into FeeTypes (name) values (?)";

        let database = self.connection.lock().await;
        Ok(database
            .execute(QUERY, params![fee_type.name])
            .map(|_| ())?)
    }

    pub async fn get_all_fee_types(&self) -> Result<Vec<FeeType>, DatabaseError> {
        const QUERY: &str = "select id, name from FeeTypes;";

        let database = self.connection.lock().await;
        let mut statement = database.prepare(QUERY).expect("Invalid SQl");
        statement
            .query_map((), |row| {
                Ok(FeeType {
                    id: row.get(0)?,
                    name: row.get(1)?,
                })
            })?
            .map(|item| item.map_err(DatabaseError))
            .collect()
    }

    pub async fn get_all_apartment_id(&self) -> Result<Vec<ApartmentId>, DatabaseError> {
        const QUERY: &str = "select id from Apartments;";

        let database = self.connection.lock().await;
        let mut statement = database.prepare(QUERY).expect("Invalid SQL");
        statement
            .query_map((), |row| row.get(0))?
            .map(|item| item.map_err(DatabaseError))
            .collect()
    }

    pub async fn add_fee(
        &self,
        fee: Fee,
        for_apartments: &[ApartmentId],
    ) -> Result<(), DatabaseError> {
        const QUERY: &str = "insert into Fees
            (amount, paid, optional, due_on, type_id, apartment_id) values
            (?     , ?   , ?       , ?     , ?      , ?           );";

        let mut database = self.connection.lock().await;
        let transaction = database.transaction().map_err(DatabaseError)?;
        let mut statement = transaction.prepare(QUERY).expect("Invalid SQL");

        for_apartments
            .iter()
            .map(|apartment_id| {
                statement
                    .execute(params![
                        fee.amount,
                        false,
                        fee.optional,
                        fee.due_on,
                        fee.type_id,
                        apartment_id,
                    ])
                    .map_err(DatabaseError)
            })
            .collect::<Result<Vec<usize>, DatabaseError>>()?;

        drop(statement);

        transaction.commit().expect("Unable to commit");

        Ok(())
    }

    pub async fn delete_fees(&self, fee_type: FeeTypeId) -> Result<(), DatabaseError> {
        const QUERY: &str = "delete from Fees where type_id = (?);";

        let database = self.connection.lock().await;
        Ok(database.execute(QUERY, params![fee_type]).map(|_| ())?)
    }
}

fn create_tables(connection: &Connection) {
    connection
        .execute_batch(INIT_TABLES)
        .expect("Creating tables failed");

    connection
        .execute_batch(INIT_ROLES)
        .expect("Adding roles failed");
}
