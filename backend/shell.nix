{ pkgs, ... }: pkgs.mkShell {
    nativeBuildInputs = with pkgs; [
        cargo
        clippy
        rust-analyzer
        rustc
        rustfmt
        sqlite
    ];

    shellHook = ''
        if [ -x "$(command -v zsh)" ]; then
            exec zsh
        fi
        '';
}
