#![deny(clippy::pedantic, clippy::complexity, clippy::perf)]

mod config;
mod database;
mod logger;

use std::net::SocketAddr;
use std::str::FromStr;

use log::error;
use warp::Filter;

use crate::config::Configuration;
use crate::database::Database;

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

    let hello = warp::path!("hello" / String).map(|name| format!("Hello, {name}!"));
    let help = warp::path::end().map(|| "GET /hello/<your name> to receive a message");

    let address = SocketAddr::from_str("127.0.0.1:8080").unwrap();

    warp::serve(hello.or(help)).run(address).await;
}
