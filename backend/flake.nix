{
    description = "A multi-threaded static HTTP server written in Rust";

    inputs = {
        nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    };

    outputs = inputs: {
        devShells = builtins.mapAttrs (system: pkgs: {
            default = (import ./shell.nix) pkgs;
        }) inputs.nixpkgs.legacyPackages;

        packages = builtins.mapAttrs (system: pkgs: {
            default = pkgs.callPackage ./nix/package.nix { };
        }) inputs.nixpkgs.legacyPackages;

        nixosModules.default = { pkgs, ... }: {
            imports = [ ./nix/nixos-module.nix ];
            services.bluemoon-backend.package = inputs.self.packages.${pkgs.stdenv.hostPlatform.system}.default;
        };

        checks = builtins.mapAttrs (system: pkgs: {
            default = (import ./nix/test.nix { inherit inputs pkgs; });
        }) inputs.nixpkgs.legacyPackages;
    };
}
