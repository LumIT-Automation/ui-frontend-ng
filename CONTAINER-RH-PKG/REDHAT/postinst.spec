%post
#!/bin/bash

printf "\n* Container postinst...\n" | tee -a /dev/tty

printf "\n* Building podman image...\n" | tee -a /dev/tty
cd /usr/lib/ui

# Build container image.
buildah bud -t ui . | tee -a /dev/tty

printf "\n* The container will start in few seconds.\n\n"

function containerSetup()
{
    wallBanner="RPM automation-interface-ui-container post-install configuration message:\n"
    cd /usr/lib/ui

    # Grab the host timezone.
    timeZone=$(timedatectl show| awk -F'=' '/Timezone/ {print $2}')

    # First container run: associate name, bind ports, define init process, ...
    podman run --name ui -dt localhost/ui /lib/systemd/systemd

    printf "$wallBanner Starting Container Service on HOST..." | wall -n
    systemctl daemon-reload

    systemctl start automation-interface-ui-container # (upon installation, container is already run).
    systemctl enable automation-interface-ui-container

    printf "$wallBanner Set the timezone of the container to be the same as the host timezone..." | wall -n
    podman exec ui bash -c "timedatectl set-timezone $timeZone"

    # syslog-ng seems going into a catatonic state while updating a package: restarting the whole thing.
    if dpkg -l | grep automation-interface-log | grep -q ^ii; then
        if systemctl list-unit-files | grep -q syslog-ng.service; then
            systemctl restart syslog-ng || true # on host.
            podman exec ui systemctl restart syslog-ng # on this container.
        fi
    fi

    printf "$wallBanner Installation completed." | wall -n
}

systemctl start atd

{ declare -f; cat << EOM; } | at now
containerSetup
EOM

exit 0

