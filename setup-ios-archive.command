#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"
sh scripts/setup-ios-archive.sh

printf '\nPress Return to close this window.\n'
read _
