{
    lib,
    rustPlatform,
    sqlite
}:

rustPlatform.buildRustPackage (finalAttrs: {
    pname = "backend";
    version = "0.1.0";

    src = lib.cleanSource ../.;

    buildInputs = [
        sqlite
    ];

    cargoDeps = rustPlatform.importCargoLock {
        lockFile = ../Cargo.lock;
    };

    meta = {
        mainProgram = "backend";
    };
})
