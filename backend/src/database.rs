use std::sync::Arc;

use rusqlite::Connection;
use tokio::sync::Mutex;

use crate::config::{DatabaseConfig, User};

/// A thin wrapper for Rusqlite's Sqlite connection, shareable between threads though only one could
/// read from, write to it at any time.
pub struct Database {
    connection: Arc<Mutex<Connection>>,
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
}

fn create_tables(connection: &Connection) {
    connection
        .execute_batch(INIT_TABLES)
        .expect("Creating tables failed");

    connection
        .execute_batch(INIT_ROLES)
        .expect("Adding roles failed");
}
