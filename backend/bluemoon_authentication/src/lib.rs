#![deny(clippy::pedantic, clippy::complexity, clippy::perf)]
#![allow(clippy::cast_possible_truncation)]

mod salt;

use std::collections::HashMap;
use std::convert::Infallible;
use std::fmt;
use std::hash::Hash;
use std::str::FromStr;
use std::sync::Arc;

use http::StatusCode;

use tokio::sync::RwLock;

use warp::reject::{Reject, Rejection};
use warp::reply::{Reply, Response, html, with_header, with_status};

use bluemoon_database::Database;

use crate::salt::{random_base64_string, salt_and_hash};

#[derive(Clone, Hash, PartialEq, Eq)]
pub struct AuthenticationToken(String);

pub struct Credential {
    username: String,
    password: String,
}

#[derive(Clone, Copy, PartialEq, PartialOrd)]
pub enum PrivilegeLevel {
    Resident,
    Accountant,
    Admin,
}

#[derive(Clone, Default)]
pub struct AuthenticatedUsers {
    tokens: Arc<RwLock<HashMap<AuthenticationToken, PrivilegeLevel>>>,
    users: Arc<RwLock<HashMap<String, AuthenticationToken>>>,
}

#[derive(Debug)]
pub struct NoSessionToken;

impl Reject for NoSessionToken {}

#[derive(Debug)]
pub struct UnderAuthenticated;

impl Reject for UnderAuthenticated {}

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

impl fmt::Display for PrivilegeLevel {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(match self {
            Self::Resident => "resident",
            Self::Accountant => "accountant",
            Self::Admin => "admin",
        })
    }
}

impl AuthenticatedUsers {
    #[must_use]
    pub fn new() -> Self {
        Self {
            tokens: Arc::new(RwLock::new(HashMap::new())),
            users: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn authenticated_as(&self, token: AuthenticationToken) -> Option<PrivilegeLevel> {
        self.tokens.read().await.get(&token).copied()
    }

    async fn revoke_token(&mut self, token: &AuthenticationToken) -> Result<(), ()> {
        self.users.write().await.retain(|_key, item| item != token);
        self.tokens.write().await.remove(token).ok_or(())?;
        Ok(())
    }

    async fn insert(&mut self, user: String, role: PrivilegeLevel) -> AuthenticationToken {
        let token = AuthenticationToken::generate();
        if let Some(old_token) = self.users.read().await.get(&user) {
            self.tokens.write().await.remove(old_token);
        }

        self.users.write().await.insert(user, token.clone());
        self.tokens.write().await.insert(token.clone(), role);

        token
    }
}

impl AuthenticationToken {
    #[must_use]
    pub fn new(token: String) -> Self {
        Self(token)
    }

    fn generate() -> Self {
        const TOKEN_LENGTH: usize = 64;
        let token = random_base64_string(TOKEN_LENGTH);
        AuthenticationToken(token)
    }
}

impl AuthenticatedUsers {
    /// Processes authentication, hands the client a `Session-Token` cookie if the supplied
    /// credentials is valid. Rejects the authentication request otherwise.
    ///
    /// # Errors
    ///
    /// Infallible
    ///
    /// # Panics
    ///
    /// Will panic if the database contains garbage data
    pub async fn process_authentication_handle(
        mut self,
        request: String,
        database: Database,
    ) -> Result<impl Reply, Infallible> {
        let Some(credentials) = process_login(&request) else {
            return Ok(invalid_credentials());
        };

        let Some(user) = database.get_user(&credentials.username).await else {
            return Ok(invalid_credentials());
        };

        let hashed_password = salt_and_hash(&user.salt, &credentials.password);
        if hashed_password != user.hashed_password {
            return Ok(invalid_credentials());
        }

        let Ok(role) = PrivilegeLevel::from_str(&user.role) else {
            panic!("Unknown role {}", user.role);
        };

        let token = self.insert(user.username, role).await;

        Ok(valid_credentials(&token))
    }

    /// Returns the privilege level of the session identified by `token`.
    ///
    /// # Errors
    ///
    /// Will return `NoSessionToken` when the token is unknown or has been revoked.
    pub async fn current_session_handle(self, token: String) -> Result<impl Reply, Rejection> {
        let role = self
            .authenticated_as(AuthenticationToken::new(token))
            .await
            .ok_or_else(|| Rejection::from(NoSessionToken))?;

        Ok(with_status(role.to_string(), StatusCode::OK))
    }

    /// Processes logouts, removes the coressponding `AuthenticationToken` from the server's memory
    ///
    /// # Errors
    ///
    /// Will return an error in case a non-existant token was supplied
    pub async fn logout_handle(mut self, token: String) -> Result<impl Reply, Rejection> {
        let token = AuthenticationToken::new(token);

        if self.revoke_token(&token).await.is_err() {
            Err(NoSessionToken)?;
        }

        let reply = with_status("Logout successful", StatusCode::OK);

        Ok(with_header(
            reply,
            "Set-Cookie",
            "Session-Token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
        ))
    }
}

fn valid_credentials(token: &AuthenticationToken) -> Response {
    let reply_content = html("Authenticated");
    let reply = with_status(reply_content, StatusCode::OK);
    let reply = with_header(reply, "Set-Cookie", format!("Session-Token={}", token.0));

    reply.into_response()
}

fn invalid_credentials() -> Response {
    let reply_content = html("INVALID CREDENTIALS");
    let reply = with_status(reply_content, StatusCode::FORBIDDEN);

    reply.into_response()
}

fn process_login(auth: &str) -> Option<Credential> {
    use base64::prelude::{BASE64_STANDARD, Engine};

    let (auth_type, auth_key) = auth.split_once(' ')?;
    if !auth_type.eq_ignore_ascii_case("basic") {
        return None;
    }

    let credentials = BASE64_STANDARD.decode(auth_key).ok()?;

    let stringified = String::from_utf8(credentials).ok()?;

    let (username, password) = stringified.split_once(':')?;

    Some(Credential {
        username: username.trim().to_string(),
        password: password.trim().to_string(),
    })
}
