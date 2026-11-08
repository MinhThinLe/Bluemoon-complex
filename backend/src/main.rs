#![deny(clippy::pedantic, clippy::complexity, clippy::perf)]
#![allow(clippy::cast_possible_truncation)]

mod authentication;
mod config;
mod handles;
mod logger;
mod server;

use log::error;

use bluemoon_database::Database;

use crate::config::Configuration;
use crate::server::Server;

#[tokio::main]
async fn main() {
    let config = Configuration::init().await;
    let database = match Database::new(&config.database_config) {
        Ok(database) => database,
        Err(message) => {
            error!("{message}");
            return;
        }
    };
    database.add_admin_users(&config.default_users).await;

    let server = Server::new(config.server_config.clone(), database);
    server.serve().await;
}
