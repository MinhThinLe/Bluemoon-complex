{
    pkgs,
    lib,
    config,
    ...
}:
let
    inherit (pkgs.lib)
        mkIf
        mkOption
        types
        mkEnableOption
        ;
    cfg = config.services.bluemoon-backend;
    settingsFormat = pkgs.formats.toml { };
    settingsFile = settingsFormat.generate "config.toml" cfg.settings;
in
{
    options.services.bluemoon-backend = {
        enable = mkEnableOption "Whether to enable the backend service for the Bluemoon comlex management software";

        package = mkOption {
            type = types.nullOr types.package;
            default = null;
            description = "The backend to use";
        };

        user = mkOption {
            type = types.str;
            default = "bluemoon";
            example = "user";
            description = ''
                The user to run the backend as.
                By default, a `bluemoon` user will be created.
            '';
        };

        group = mkOption {
            type = types.str;
            default = "bluemoon";
            example = "group";
            description = ''
                The group to run the backend as.
                By default, a `bluemoon` group will be created.
            '';
        };

        dataDir = mkOption {
            type = types.str;
            default = "/var/lib/bluemoon/";
            description = "The data storage location";
        };

        openFireWall = mkOption {
            type = types.bool;
            default = false;
            example = true;
            description = ''
                Whether to open the firewall
            '';
        };

        settings = mkOption {
            type = settingsFormat.type;
            default = { };
        };
    };

    config = mkIf config.services.bluemoon-backend.enable {
        users.users = mkIf (cfg.user == "bluemoon") {
            ${cfg.user} = {
                group = cfg.group;
                home = cfg.dataDir;
                createHome = true;
                isNormalUser = true;
                description = "Bluemoon backend user";
            };
        };

        users.groups."bluemoon" = { };

        systemd.services.bluemoon-backend = mkIf cfg.enable {
            after = [ "network.target" ];
            wantedBy = [ "multi-user.target" ];
            serviceConfig = {
                Restart = "on-failure";
                User = cfg.user;
                Group = cfg.group;
                ExecStart =
                    let
                        args = (if cfg.settings != { } then "--config-file ${settingsFile}" else "");
                    in
                    "${lib.getExe cfg.package} ${args}";
            };
        };
    };
}
