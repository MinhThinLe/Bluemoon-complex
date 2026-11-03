use std::net::SocketAddr;
use std::path::PathBuf;

use toml::Table;

pub struct ServerConfig {
    listen_address: SocketAddr,
}

pub struct DatabaseConfig {
    path: PathBuf,
}

pub struct User {
    username: String,
    hashed_password: String,
}

struct Users(Vec<User>);

pub struct Configuration {
    server_config: ServerConfig,
    database_config: DatabaseConfig,
    default_users: Users,
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
            database_config: database_table.try_into()?,
            default_users: user_table.try_into()?,
        })
    }
}

impl TryFrom<&Table> for DatabaseConfig {
    type Error = String;
    fn try_from(value: &Table) -> Result<Self, Self::Error> {
        let path =
            get_string(value, "path").map_err(|reason| format!("`database.path` {reason}"))?;

        Ok(Self { path: path.into() })
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
                        username: key.to_string(),
                        hashed_password: str.to_string(),
                    })
                })
                .collect(),
        ))
    }
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
    fn test_database_config_parsing() {
        const DATABASE_CONFIG_1: &str = r#"
            path = "/path/here"
        "#;
        const DATABASE_CONFIG_2: &str = r#"
        "#;

        let table = DATABASE_CONFIG_1.parse::<Table>().unwrap();
        let config = DatabaseConfig::try_from(&table).unwrap();

        assert_eq!(config.path, PathBuf::from("/path/here"));

        let table = DATABASE_CONFIG_2.parse::<Table>().unwrap();
        let config = DatabaseConfig::try_from(&table);

        assert!(config.is_err());
    }

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
