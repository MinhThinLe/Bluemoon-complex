(import ./lib.nix) {
    name = "from-nixos";
    nodes = {
        node1 = { self, pkgs, ... }: {
            imports = [ self.nixosModules.bluemoon-backend ];
            environment.systemPackages = [ pkgs.curl ];

            services.bluemoon-backend = {
                enable = true;
                settings = {
                    server = {
                        listen_address = "0.0.0.0:3030";
                    };
                    database = {
                        path = "/var/lib/bluemoon/test.db3";
                    };
                    users = {
                        admin = "XohImNooBHFR0OVvjcYpJ3NgPQ1qq73WKhHvch0VQtg=";
                    };
                };
            };
        };
    };

    testScript = ''
        start_all()

        node1.wait_for_unit("bluemoon-backend")
        node1.wait_for_open_port(3030)

        output = node1.succeed("${../tests/sign-in.sh}")
        output = node1.succeed("${../tests/add-fee-type.sh}")
        output = node1.succeed("${../tests/add-fee-type.sh}")
    '';
}
