use base64::prelude::*;
use rand::Rng;
use sha2::{Digest, Sha256};

// Doesn't actually guarantee that the returned string has length `length` because base64
// stuff.
pub fn random_base64_string(length: usize) -> String {
    const BASE64_DATA_DENSITY: usize = 6;
    const BITS_PER_BYTE: usize = 8;
    let mut data = vec![0; length * BASE64_DATA_DENSITY / BITS_PER_BYTE];

    rand::rng().fill_bytes(&mut data);

    let encoded = BASE64_STANDARD.encode(data);
    encoded
}

pub fn salt_and_hash(salt: &str, password: &str) -> String {
    println!("password: {password}, salt: {salt}");
    let salted = format!("{password}{salt}");
    BASE64_STANDARD.encode(Sha256::digest(salted))
}
