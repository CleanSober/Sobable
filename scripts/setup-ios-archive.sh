#!/usr/bin/env sh
set -eu

log() {
  printf '\n%s\n' "$1"
}

fail() {
  printf '\nSetup stopped: %s\n' "$1" >&2
  exit 1
}

load_node_path() {
  export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

  for profile in "$HOME/.zprofile" "$HOME/.zshrc" "$HOME/.bash_profile" "$HOME/.bashrc" "$HOME/.profile"; do
    if [ -f "$profile" ]; then
      # shellcheck disable=SC1090
      . "$profile" >/dev/null 2>&1 || true
    fi
  done

  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    export NVM_DIR="$HOME/.nvm"
    # shellcheck disable=SC1091
    . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
    nvm use --lts >/dev/null 2>&1 || nvm use default >/dev/null 2>&1 || true
  fi

  if [ -d "$HOME/.volta/bin" ]; then
    export PATH="$HOME/.volta/bin:$PATH"
  fi

  if [ -d "$HOME/.asdf/shims" ]; then
    export PATH="$HOME/.asdf/shims:$PATH"
  fi
}

load_node_path

if ! command -v node >/dev/null 2>&1; then
  cat >&2 <<'NODE_HELP'

Setup stopped: Node.js is not available.

Install Node.js, then run this again:
- Recommended: https://nodejs.org
- Homebrew: brew install node
- nvm: nvm install --lts && nvm use --lts

NODE_HELP
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  fail "npm is not available. Reinstall Node.js with npm included, then run this script again."
fi

if ! command -v npx >/dev/null 2>&1; then
  fail "npx is not available. Reinstall Node.js/npm, then run this script again."
fi

log "Using Node: $(node --version)"
log "Using npm: $(npm --version)"

log "Installing dependencies"
npm install

log "Building web bundle"
npm run build

if [ ! -d "ios" ]; then
  log "Creating Capacitor iOS project"
  npx cap add ios
else
  log "iOS project already exists"
fi

log "Syncing Capacitor iOS project"
npx cap sync ios

if [ -f "GoogleService-Info.plist" ] && [ -d "ios/App/App" ]; then
  log "Copying GoogleService-Info.plist into iOS app target"
  cp "GoogleService-Info.plist" "ios/App/App/GoogleService-Info.plist"
fi

if [ -d "ios/App/App.xcworkspace" ]; then
  log "Opening iOS workspace"
  open "ios/App/App.xcworkspace"
else
  log "iOS workspace is ready at ios/App/App.xcworkspace"
fi

cat <<'NEXT_STEPS'

Next steps in Xcode:
1. Select the App project, then the App target.
2. Open Signing & Capabilities.
3. Choose your Apple Developer Team.
4. Confirm Bundle Identifier is com.sober.club, or change it to the identifier in App Store Connect.
5. Select Any iOS Device or a Generic iOS Device destination.
6. Use Product > Archive.

Product > Archive requires valid Apple signing. Simulator builds do not.
NEXT_STEPS
