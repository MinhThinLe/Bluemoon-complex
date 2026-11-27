mod salt;

use std::str::FromStr;

pub use salt::{random_base64_string, salt_and_hash};

#[derive(Debug)]
pub struct Credential {
    username: String,
    password: String,
}

impl FromStr for Credential {
    type Err = ();
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        use base64::prelude::{BASE64_STANDARD, Engine};

        let (auth_type, auth_key) = s.split_once(' ').ok_or(())?;
        if !auth_type.eq_ignore_ascii_case("basic") {
            return Err(());
        }

        let credentials = BASE64_STANDARD.decode(auth_key).map_err(|_| ())?;

        let stringified = String::from_utf8(credentials).map_err(|_| ())?;

        let (username, password) = stringified.split_once(':').ok_or(())?;

        Ok(Credential {
            username: username.trim().to_string(),
            password: password.trim().to_string(),
        })
    }
}

impl Credential {
    pub fn username(&self) -> &str {
        &self.username
    }

    pub fn password(&self) -> &str {
        &self.password
    }
}
