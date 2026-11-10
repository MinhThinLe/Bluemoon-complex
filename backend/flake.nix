{
    description = "A multi-threaded static HTTP server written in Rust";

    inputs = {
        nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    };

    outputs =
        { self, nixpkgs }:
        let
            forAllSystems = nixpkgs.lib.genAttrs [
                "x86_64-linux"
                "aarch64-linux"
            ];
        in
        {
            devShells = builtins.mapAttrs (system: pkgs: {
                default = (import ./shell.nix) pkgs;
            }) nixpkgs.legacyPackages;

            packages = builtins.mapAttrs (system: pkgs: {
                default = pkgs.callPackage ./nix/package.nix { };
            }) nixpkgs.legacyPackages;

            nixosModules.bluemoon-backend = { pkgs, lib, ... }: {
                imports = [ ./nix/nixos-module.nix ];
                services.bluemoon-backend.package = self.packages.${pkgs.stdenv.hostPlatform.system}.default;
            };

            checks = forAllSystems (system: {
                bluemoon-backend = import ./nix/test.nix {
                    pkgs = nixpkgs.legacyPackages.${system};
                    inherit self;
                };
            });
        };
}
