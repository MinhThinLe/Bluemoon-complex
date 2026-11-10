{ pkgs, ... }: pkgs.mkShell {
    nativeBuildInputs = with pkgs; [
        cargo
        clippy
        rust-analyzer
        rustc
        rustfmt
        sqlite
    ];
}
