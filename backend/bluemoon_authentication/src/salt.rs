use base64::prelude::*;
use sha2::{Digest, Sha256};
use rand::Rng;

pub fn new_salt() -> String {
    const SALT_LENGTH: usize = 12;
    random_base64_string(SALT_LENGTH)
}

// Doesn't actually guarantee that the returned string has length `length` because base64
// stuff.
pub(crate) fn random_base64_string(length: usize) -> String {
    const BASE64_DATA_DENSITY: usize = 6;
    const BITS_PER_BYTE: usize = 8;
    let mut data = vec![0; length * BASE64_DATA_DENSITY / BITS_PER_BYTE];

    rand::rng().fill_bytes(&mut data);

    println!("{data:#?}");

    let encoded = BASE64_STANDARD.encode(data);
    encoded
}

pub(crate) fn salt_and_hash(salt: &str, password: &str) -> String {
    let salted = format!("{password}{salt}");
    BASE64_STANDARD.encode(Sha256::digest(salted))
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_salt_length() {
        let salt = new_salt();
        assert_eq!(salt.len(), 12);
    }
}
