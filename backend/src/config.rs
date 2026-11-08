use std::net::SocketAddr;
use std::ops::Deref;
use std::path::PathBuf;
use std::process::exit;

use log::{error, info, warn};
use tokio::fs;

use toml::Table;

use bluemoon_database::{DatabaseConfig, User};

use crate::logger::Logger;

#[derive(Clone, Debug)]
pub struct ServerConfig {
    pub listen_address: SocketAddr,
}

pub struct Users(Vec<User>);

pub struct Configuration {
    pub server_config: ServerConfig,
    pub database_config: DatabaseConfig,
    pub default_users: Users,
}

impl TryFrom<&Table> for Configuration {
    type Error = String;
    fn try_from(value: &Table) -> Result<Self, Self::Error> {
        let get_table = |key| -> Result<&Table, Self::Error> {
            let value = value
                .get(key)
                .ok_or_else(|| format!("The table `{key}` isn't defined"))?;
            value
                .as_table()
                .ok_or_else(|| format!("`{key}` isn't a table"))
        };

        let server_table = get_table("server")?;
        let database_table = get_table("database")?;
        let user_table = get_table("users")?;

        Ok(Self {
            server_config: server_table.try_into()?,
            database_config: parse_db_config(database_table)?,
            default_users: user_table.try_into()?,
        })
    }
}

impl TryFrom<&Table> for ServerConfig {
    type Error = String;
    fn try_from(value: &Table) -> Result<Self, Self::Error> {
        let listen_adress = get_string(value, "listen_address")
            .map_err(|reason| format!("`server.listen_address` {reason}"))?;

        Ok(Self {
            listen_address: listen_adress
                .parse()
                .map_err(|err| format!("Could not parse `server.listen_address` due to {err}"))?,
        })
    }
}

impl TryFrom<&Table> for Users {
    type Error = String;
    fn try_from(value: &Table) -> Result<Self, Self::Error> {
        // Holy hell, also good luck with the review
        Ok(Users(
            value
                .iter()
                .filter_map(|(key, value)| {
                    value.as_str().map(|str| User {
                        username: key.clone(),
                        hashed_password: str.to_string(),
                        salt: String::new(),
                        role: "admin".to_string(),
                    })
                })
                .collect(),
        ))
    }
}

impl Deref for Users {
    type Target = [User];
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl Configuration {
    pub async fn init() -> Self {
        if let Err(e) = log::set_logger(&Logger)
            .map(|()| log::set_max_level(Logger::level().unwrap_or_else(|| exit(0))))
        {
            eprintln!("Failed to initialize the logging system due to {e}");
        }

        info!("Log level is set to {}", log::max_level());

        let config_path = get_config_path();

        let Ok(content) = fs::read_to_string(&config_path).await else {
            error!(
                "Unable to read config content from {}",
                config_path.display()
            );
            exit(1);
        };

        let table: Table = match content.parse() {
            Ok(table) => table,
            Err(message) => {
                error!("{message}");
                exit(1)
            }
        };

        match Configuration::try_from(&table) {
            Ok(config) => config,
            Err(message) => {
                error!("{message}");
                exit(1)
            }
        }
    }
}

fn parse_db_config(table: &Table) -> Result<DatabaseConfig, String> {
    let path = get_string(table, "path").map_err(|reason| format!("`database.path` {reason}"))?;

    let path = PathBuf::from(path);
    match path.try_exists() {
        Ok(true) => (),
        Ok(false) => {
            warn!("`database.path` does not exist on the filesystem, creating a new database");
        }
        Err(err) => Err(format!("Unable to read from the filesystem due to {err}"))?,
    }

    Ok(DatabaseConfig::new(path))
}

fn get_config_path() -> PathBuf {
    const CONFIG_FILE_LOCATION: &str = "--config-file";
    let commandline_args: Vec<String> = std::env::args().collect();

    let Some(index) = commandline_args
        .iter()
        .position(|item| item == CONFIG_FILE_LOCATION)
    else {
        return PathBuf::from("/etc/bluemoon/config.toml"); // Won't work on Windows btw
    };

    let Some(item) = commandline_args.get(index + 1) else {
        error!("The --config-file flag must be followed by a path");
        exit(1);
    };

    PathBuf::from(item)
}

fn get_string<'table>(table: &'table Table, key: &'table str) -> Result<&'table str, &'static str> {
    let value = table.get(key).ok_or("isn't defined")?;
    value.as_str().ok_or("isn't a string")
}

#[cfg(test)]
mod test {
    use std::net::{Ipv4Addr, SocketAddrV4};

    use super::*;

    #[test]
    fn test_server_config_parsing() {
        const SERVER_CONFIG_1: &str = r#"
            listen_address = "0.0.0.0:8080"
        "#;
        const SERVER_CONFIG_2: &str = r#"
        "#;

        let table = SERVER_CONFIG_1.parse::<Table>().unwrap();
        let config = ServerConfig::try_from(&table).unwrap();

        assert_eq!(
            config.listen_address,
            SocketAddr::V4(SocketAddrV4::new(Ipv4Addr::UNSPECIFIED, 8080))
        );

        let table = SERVER_CONFIG_2.parse::<Table>().unwrap();
        let config = ServerConfig::try_from(&table);

        assert!(config.is_err());
    }

    #[test]
    fn test_users_parsing() {
        const USERS_1: &str = r#"
            admin = "this is hashed, trust me bro"
            invalid = 1
            admin2 = "skipped the guy above"
        "#;

        let table = USERS_1.parse::<Table>().unwrap();
        let users = Users::try_from(&table).unwrap();

        assert_eq!(users.0.len(), 2);

        assert_eq!(users.0[0].username, "admin");
        assert_eq!(users.0[0].hashed_password, "this is hashed, trust me bro");

        assert_eq!(users.0[1].username, "admin2");
        assert_eq!(users.0[1].hashed_password, "skipped the guy above");
    }
}
