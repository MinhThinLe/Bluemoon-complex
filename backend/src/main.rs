#![deny(clippy::pedantic, clippy::complexity, clippy::perf)]

mod config;
mod logger;

use std::net::SocketAddr;
use std::str::FromStr;

use warp::Filter;

use crate::config::Configuration;

#[tokio::main]
async fn main() {
    let _configuration = Configuration::init().await;

    let hello = warp::path!("hello" / String).map(|name| format!("Hello, {name}!"));
    let help = warp::path::end().map(|| "GET /hello/<your name> to receive a message");

    let address = SocketAddr::from_str("127.0.0.1:8080").unwrap();

    warp::serve(hello.or(help)).run(address).await;
}
