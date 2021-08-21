%pre
#!/bin/bash

if getenforce | grep -q Enforcing;then
    echo -e "\n* Warning: \e[32mselinux enabled\e[0m. To install this package please temporary disable it during the installation (setenforce 0), then re-enable it.\n"
    exit 1
fi

printf "\n* Container preinst...\n"
printf "\n* Cleanup...\n"

if podman ps | awk '{print $2}' | grep -q ^localhost/ui$; then
    podman stop ui
fi

if podman images | awk '{print $1}' | grep -q ^localhost/ui$; then
    buildah rmi --force ui
fi

# Be sure there is not rubbish around.
if podman ps --all | awk '{print $2}' | grep -q ^localhost/ui$; then
    cIds=$( podman ps --all | awk '$2 == "localhost/ui" { print $1 }' )
    for id in $cIds; do
        podman rm -f $id
    done
fi

exit 0

