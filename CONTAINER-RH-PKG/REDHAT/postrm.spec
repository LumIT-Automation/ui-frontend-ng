%postun
#!/bin/bash

printf "\n* Container postrm...\n"

# Use image label to cleanup possible orphaned images.
oImgs=$(buildah images | grep -F '<none>' | awk '{print $3}')
for img in $oImgs ; do
    if buildah inspect $img | grep -q '"AUTOMATION_CONTAINER_IMAGE": "ui"'; then
        buildah rmi --force $img
    fi
done

