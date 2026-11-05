use std::{collections::HashMap, convert::Infallible, str::FromStr, sync::Arc};

use base64::Engine;
use http::StatusCode;
use sha2::{Digest, Sha256};
use tokio::sync::RwLock;
use warp::{
    reject::Reject,
    reply::{Reply, Response, html, with_header, with_status},
};

use crate::server::Server;

#[derive(Hash, PartialEq, Eq)]
pub struct AuthenticationToken(String);

#[derive(Clone, Copy, Debug)]
pub enum PrivilegeLevel {
    Resident,
    Accountant,
    Admin,
}

pub struct Credential {
    username: String,
    password: String,
}

#[derive(Clone)]
pub struct AuthenticatedUsers {
    tokens: Arc<RwLock<HashMap<AuthenticationToken, PrivilegeLevel>>>,
}

#[derive(Debug)]
pub struct NoSessionToken;

impl Reject for NoSessionToken {}

impl AuthenticatedUsers {
    pub fn new() -> Self {
        Self {
            tokens: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn authenticated_as(&self, token: AuthenticationToken) -> Option<PrivilegeLevel> {
        self.tokens.read().await.get(&token).copied()
    }
}

impl FromStr for PrivilegeLevel {
    type Err = ();
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(match s.to_lowercase().as_str() {
            "resident" => Self::Resident,
            "accountant" => Self::Accountant,
            "admin" => Self::Admin,
            _other => return Err(()),
        })
    }
}

impl AuthenticationToken {
    pub fn new(value: &impl ToString) -> Self {
        Self(value.to_string())
    }
}

impl Server {
    pub async fn process_authentication_handle(
        self,
        request: String,
    ) -> Result<impl Reply, Infallible> {
        let Some(credentials) = process_login(&request) else {
            return Ok(invalid_credentials());
        };

        let Some(user) = self.database.get_user(&credentials.username).await else {
            return Ok(invalid_credentials());
        };

        let salted_password = format!("{}{}", credentials.password, user.salt);

        let hashed_password =
            base64::prelude::BASE64_STANDARD.encode(Sha256::digest(salted_password));

        if hashed_password != user.hashed_password {
            return Ok(invalid_credentials());
        }

        let token = AuthenticationToken::new(&hashed_password);
        self.users.tokens.write().await.insert(token, user.role);

        // Using hashed_password is probably a bad idea
        Ok(valid_credentials(&hashed_password))
    }
}

fn valid_credentials(cookie: &str) -> Response {
    let reply_content = html("Authenticated");
    let reply = with_status(reply_content, StatusCode::OK);
    let reply = with_header(reply, "Set-Cookie", format!("Session-Token={cookie}"));

    reply.into_response()
}

fn invalid_credentials() -> Response {
    let reply_content = html("INVALID CREDENTIALS");
    let reply = with_status(reply_content, StatusCode::FORBIDDEN);

    reply.into_response()
}

fn process_login(auth: &str) -> Option<Credential> {
    let (auth_type, auth_key) = auth.split_once(' ')?;
    if !auth_type.eq_ignore_ascii_case("basic") {
        return None;
    }

    let credentials = base64::prelude::BASE64_STANDARD.decode(auth_key).ok()?;

    let stringified = String::from_utf8(credentials).ok()?;

    let (username, password) = stringified.split_once(':')?;

    Some(Credential {
        username: username.trim().to_string(),
        password: password.trim().to_string(),
    })
}
