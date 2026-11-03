PRAGMA foreign_keys = ON;

CREATE TABLE Roles (
    role_id INTEGER PRIMARY KEY,
    role_name TEXT NOT NULL
);

CREATE TABLE ApartmentTypes (
    apartment_type_id INTEGER PRIMARY KEY,
    apartment_type_name TEXT NOT NULL,
    management_fee REAL NOT NULL
);

CREATE TABLE Apartments (
    apartment_id INTEGER PRIMARY KEY,
    area REAL NOT NULL CHECK (area > 0),
    apartment_type_id INTEGER NOT NULL,

    FOREIGN KEY (apartment_type_id)
        REFERENCES ApartmentTypes(apartment_type_id)
);

CREATE TABLE Residents (
    resident_id INTEGER PRIMARY KEY,
    resident_name TEXT NOT NULL,
    gender INTEGER NOT NULL,
    date_of_birth INTEGER NOT NULL,
    move_in INTEGER NOT NULL,
    move_out INTEGER,
    spouse_of INTEGER,
    child_of INTEGER,
    apartment INTEGER NOT NULL,

    FOREIGN KEY (spouse_of)
        REFERENCES Residents(resident_id),

    FOREIGN KEY (child_of)
        REFERENCES Residents(resident_id),

    FOREIGN KEY (apartment)
        REFERENCES Apartments(apartment_id)
);

CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY,
    user_name TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    salt TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    belongs_to INTEGER,

    FOREIGN KEY (role_id)
        REFERENCES Roles(role_id),

    FOREIGN KEY (belongs_to)
        REFERENCES Residents(resident_id)
);

CREATE TABLE FeeTypes (
    fee_type_id INTEGER PRIMARY KEY,
    fee_name TEXT NOT NULL
);

CREATE TABLE Fees (
    fee_id INTEGER PRIMARY KEY,
    amount REAL NOT NULL CHECK (amount > 0),
    paid BOOLEAN NOT NULL,
    apartment_id INTEGER NOT NULL,

    FOREIGN KEY (apartment_id)
        REFERENCES Apartments(apartment_id)
);