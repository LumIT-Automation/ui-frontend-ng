#!/bin/bash

set -e

function System()
{
    base=$FUNCNAME
    this=$1

    # Declare methods.
    for method in $(compgen -A function)
    do
        export ${method/#$base\_/$this\_}="${method} ${this}"
    done

    # Properties list.
    ACTION="$ACTION"
}

# ##################################################################################################################################################
# Public
# ##################################################################################################################################################

#
# Void System_run().
#
function System_run()
{
    if [ "$ACTION" == "deb" ]; then
        if System_checkEnvironment; then
            System_definitions
            System_cleanup

            System_systemFilesSetup
            System_controlFilesSetup

            System_webpack
            System_codeCollect
            System_codeFilesPermissions

            System_debCreate
            System_cleanup

            echo "Created /tmp/$projectName.deb"
        else
            echo "A Debian Buster operating system is required for the deb-ification. Aborting."
            exit 1
        fi
    else
        exit 1
    fi
}

# ##################################################################################################################################################
# Private static
# ##################################################################################################################################################

function System_checkEnvironment()
{
    if [ -f /etc/os-release ]; then
        if ! grep -q 'Debian GNU/Linux 10 (buster)' /etc/os-release; then
            return 1
        fi
    else
        return 1
    fi

    return 0
}


function System_definitions()
{
    declare -g debPackageRelease
    declare -g currentGitCommit

    declare -g projectName
    declare -g workingFolder
    declare -g workingFolderPath

    if [ -f DEBIAN-PKG/deb.release ]; then
        # Get program version from the release file.
        debPackageRelease=$(echo $(cat DEBIAN-PKG/deb.release))
    else
        echo "Error: deb.release missing."
        echo "Usage: bash DEBIAN-PKG/make-release.sh --action deb"
        echo "Install with apt install -y ./package.deb"
        exit 1
    fi

    currentGitCommit=$(git log --pretty=oneline | head -1 | awk '{print $1}')

    projectName="automation-interface-ui_${debPackageRelease}_all"
    workingFolder="/tmp"
    workingFolderPath="${workingFolder}/${projectName}"
}


function System_cleanup()
{
    if [ -n "$workingFolderPath" ]; then
        if [ -d "$workingFolderPath" ]; then
            rm -fR "$workingFolderPath"
        fi

        if [ -d build ]; then
            rm -fR build
        fi
    fi

    # Create a new working folder.
    mkdir $workingFolderPath
}


function System_webpack()
{
    cd ..

    # Remove development notes.
    cp -af src/config.js /tmp
    sed -i '/.*DEVELOPMENT/d' src/config.js
    sed -i 's|//AUTH_URL|AUTH_URL|g' src/config.js
    sed -i 's|//SUPERADMIN_URL|SUPERADMIN_URL|g' src/config.js
    sed -i 's|//BACKEND_URL|BACKEND_URL|g' src/config.js

    echo "** Double check config.js is insisting upon production endpoints **."

    npm run build

    if [ $? -ne 0 ]; then
        echo "If the build fails, please try deleting the node_modules folder and recreating the vagrant vm from scratch."
    fi

    # Cleanup.
    mv -f /tmp/config.js src/config.js

    cd -
}


function System_codeCollect()
{
    # Copy the webpack.
    mkdir -p $workingFolderPath/var/www/ui
    mv ../build $workingFolderPath/var/www/ui/
}


function System_codeFilesPermissions()
{
    # Forcing standard permissions (755 for folders, 644 for files, owned by www-data:www-data).
    chown -R www-data:www-data $workingFolderPath/var/www/ui
    find $workingFolderPath/var/www/ui -type d -exec chmod 750 {} \;
    find $workingFolderPath/var/www/ui -type f -exec chmod 640 {} \;

    # Particular permissions.
    #resources=( "$projectName/var/www/api" )
    #for res in "${resources[@]}"; do
    #    find $res -type d -exec chmod 750 {} \;
    #    find $res -type f -exec chmod 640 {} \;
    #done
}


function System_systemFilesSetup()
{
    # Setting up system files.
    cp -R DEBIAN-PKG/etc $workingFolderPath
    cp -R DEBIAN-PKG/usr $workingFolderPath

    find $workingFolderPath -type d -exec chmod 0755 {} \;
    find $workingFolderPath -type f -exec chmod 0644 {} \;

    chmod +x $workingFolderPath/usr/bin/consul.sh
    chmod +x $workingFolderPath/usr/bin/syslogng-target.sh
}


function System_controlFilesSetup()
{
    # Setting up all the files needed to build the package.
    cp -R DEBIAN-PKG/DEBIAN $workingFolderPath

    sed -i "s/^Version:.*/Version:\ $debPackageRelease/g" $workingFolderPath/DEBIAN/control
    sed -i "s/GITCOMMIT/$currentGitCommit/g" $workingFolderPath/DEBIAN/control

    chmod +x $workingFolderPath/DEBIAN/postinst
}


function System_debCreate()
{
    cd $workingFolder
    dpkg-deb --build $projectName
}

# ##################################################################################################################################################
# Main
# ##################################################################################################################################################

ACTION=""

# Must be run as root.
ID=$(id -u)
if [ $ID -ne 0 ]; then
    echo "This script needs super cow powers."
    exit 1
fi

# Parse user input.
while [[ $# -gt 0 ]]; do
    key="$1"

    case $key in
        --action)
            ACTION="$2"
            shift
            shift
            ;;

        *)
            shift
            ;;
    esac
done

if [ -z "$ACTION" ]; then
    echo "Missing parameters. Use --action deb."
else
    System "system"
    $system_run
fi

exit 0
