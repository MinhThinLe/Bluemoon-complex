PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    salt TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    belongs_to INTEGER,
    FOREIGN KEY (role_id) REFERENCES Roles(id),
    FOREIGN KEY (belongs_to) REFERENCES Residents(id)
);

CREATE TABLE IF NOT EXISTS Roles (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Residents (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    gender INTEGER NOT NULL,
    date_of_birth INTEGER NOT NULL,
    moved_in INTEGER NOT NULL,
    moved_out INTEGER,
    spouse_of INTEGER,
    child_of INTEGER,
    apartment_id INTEGER NOT NULL,
    FOREIGN KEY (spouse_of) REFERENCES Residents(id),
    FOREIGN KEY (child_of) REFERENCES Residents(id),
    FOREIGN KEY (apartment_id) REFERENCES Apartments(id)
);

CREATE TABLE IF NOT EXISTS Apartments (
    id INTEGER PRIMARY KEY,
    area REAL NOT NULL CHECK (area > 0),
    type_id INTEGER NOT NULL,
    FOREIGN KEY (type_id) REFERENCES ApartmentTypes(id)
);

CREATE TABLE IF NOT EXISTS ApartmentTypes (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    service_rate INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS Fees (
    id INTEGER PRIMARY KEY,
    amount REAL NOT NULL CHECK (amount > 0),
    paid BOOLEAN NOT NULL,
    optional BOOLEAN NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (datetime('now')),
    due_on INTEGER NOT NULL,
    type_id INTEGER NOT NULL,
    apartment_id INTEGER NOT NULL,
    FOREIGN KEY (apartment_id) REFERENCES Apartments(id),
    FOREIGN KEY (type_id) REFERENCES FeeTypes(id)
);

CREATE TABLE IF NOT EXISTS FeeTypes (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);
