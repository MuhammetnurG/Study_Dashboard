#!/usr/bin/env bash
set -euo pipefail

# Simple installer for Study Dashboard
# Usage examples:
#   bash <(curl -Ls https://example.com/install.sh) REPO=https://github.com/USER/REPO.git
#   bash <(curl -Ls https://example.com/install.sh) --local

REPO_URL=""
INSTALL_DIR="/opt/study-dashboard"
SERVICE_NAME="study-dashboard"
FORCE=no
LOCAL=no
PORT=8000

while [[ $# -gt 0 ]]; do
  case "$1" in
    --local) LOCAL=yes; shift ;;
    --yes|--force) FORCE=yes; shift ;;
    --port) PORT="$2"; shift 2 ;;
    REPO=*) REPO_URL="${1#REPO=}"; shift ;;
    INSTALL_DIR=*) INSTALL_DIR="${1#INSTALL_DIR=}"; shift ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ -n "${REPO_URL:-}" ]] && [[ "$LOCAL" == "yes" ]]; then
  echo "Cannot use --local and REPO=... at the same time."; exit 1
fi

confirm() {
  if [[ "$FORCE" == "yes" ]]; then
    return 0
  fi
  read -r -p "$1 [y/N]: " reply
  [[ "$reply" =~ ^[Yy] ]] || return 1
}

echo "Installing Study Dashboard into $INSTALL_DIR"

if [[ "$LOCAL" == "yes" ]]; then
  echo "Copying files from current directory to $INSTALL_DIR"
  sudo mkdir -p "$INSTALL_DIR"
  sudo rsync -a --delete . "$INSTALL_DIR/"
else
  if [[ -z "${REPO_URL}" ]]; then
    echo "No REPO provided and not running with --local. Use REPO=https://... or --local."; exit 1
  fi
  echo "Cloning $REPO_URL into $INSTALL_DIR"
  sudo rm -rf "$INSTALL_DIR"
  sudo mkdir -p "$INSTALL_DIR"
  sudo git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
fi

# detect if Node app (package.json) exists
if sudo test -f "$INSTALL_DIR/package.json"; then
  echo "Detected Node app (package.json). Will use Node to run the server."

  if ! command -v node >/dev/null 2>&1; then
    echo "Node.js not found. Attempting to install (Debian/Ubuntu)."
    if command -v apt-get >/dev/null 2>&1; then
      sudo apt-get update; sudo apt-get install -y curl ca-certificates
      curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
      sudo apt-get install -y nodejs
    else
      echo "Automatic Node install not implemented for this OS. Please install Node 18+ and re-run."; exit 1
    fi
  fi

  sudo chown -R "$USER":"$USER" "$INSTALL_DIR"
  (cd "$INSTALL_DIR" && npm install --production)

  SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
  echo "Creating systemd service at $SERVICE_FILE"
  sudo tee "$SERVICE_FILE" >/dev/null <<EOF
[Unit]
Description=Study Dashboard static server (Node)
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=$(command -v node) $INSTALL_DIR/server.js $PORT
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

  sudo systemctl daemon-reload
  sudo systemctl enable --now "$SERVICE_NAME"
  echo "Started systemd service: $SERVICE_NAME"

else
  echo "No package.json found. Falling back to Python3 http.server on port $PORT."
  if ! command -v python3 >/dev/null 2>&1; then
    echo "python3 not found. Please install python3."; exit 1
  fi

  SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
  echo "Creating systemd service at $SERVICE_FILE"
  sudo tee "$SERVICE_FILE" >/dev/null <<EOF
[Unit]
Description=Study Dashboard static server (python)
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=$(command -v python3) -m http.server $PORT --directory $INSTALL_DIR
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

  sudo systemctl daemon-reload
  sudo systemctl enable --now "$SERVICE_NAME"
  echo "Started systemd service: $SERVICE_NAME"
fi

echo
echo "Done. The site should be available on port $PORT on this machine." 
echo "If you want to reverse-proxy via nginx, use the config in nginx.conf.example"

exit 0
