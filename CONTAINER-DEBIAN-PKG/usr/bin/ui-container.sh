#!/bin/bash

function start() {
    podman start ui
}

function stop() {
    podman stop -t 15 ui
}

function restart() {
    stop
    sleep 1
    start
}

case $1 in
        start)
            start
            ;;

        stop)
            stop
            ;;

        restart)
            stop
            start
            ;;

        *)
            echo $"Usage: $0 {start|stop|restart}"
            exit 1
esac

exit 0
