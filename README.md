Study Dashboard

A lightweight static dashboard application, deployable with a single command.
This repository includes a small static site (study_dashboard.html, script.js, styles.css) and an optional Node.js static server for hosting.

🚀 Goal

Make the project installable on any internet-connected Linux server using a one-line installer:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/MuhammetnurG/Study_Dashboard/main/install.sh) REPO=https://github.com/MuhammetnurG/Study_Dashboard.git
```

📦 What’s Included

install.sh – Automated installer (see usage below)

server.js & package.json – Minimal Node/Express static file server

study-dashboard.service – Systemd service template for persistent hosting

nginx.conf.example – Example Nginx reverse-proxy configuration

🛠 Installer Usage
Install from a Remote Git Repository

  ```bash
  bash <(curl -fsSL https://raw.githubusercontent.com/MuhammetnurG/Study_Dashboard/main/install.sh) REPO=https://github.com/MuhammetnurG/Study_Dashboard.git
  ```

- Install from the current local directory (useful for testing):

  ```bash
  bash <(curl -fsSL https://raw.githubusercontent.com/MuhammetnurG/Study_Dashboard/main/install.sh) --local
  ```

Optional Parameters

INSTALL_DIR=/opt/study-dashboard — Custom installation directory

--port 8000 — Specify a custom port for the Node server

🏗 Production Notes

The installer creates and enables a systemd service.
→ Requires sudo privileges.

For production deployment, pairing the service with Nginx + TLS is recommended.
→ Use Certbot or any ACME client for HTTPS.






