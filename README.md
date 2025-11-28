# Study Dashboard

This repository contains a small static site (`study_dashboard.html`, `script.js`, `styles.css`) and an optional small Node static server.

Goal: Make this project installable on an internet server with a single-line installer like:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/MuhammetnurG/Study_Dashboard/main/install.sh) REPO=https://github.com/MuhammetnurG/Study_Dashboard.git
```

What I added
- `install.sh` : installer script (see below)
- `server.js` and `package.json` : minimal Node/Express static server
- `study-dashboard.service` : systemd unit template
- `nginx.conf.example` : nginx reverse proxy example

Installer usage

- Install from a remote Git repo:

  ```bash
  bash <(curl -fsSL https://raw.githubusercontent.com/MuhammetnurG/Study_Dashboard/main/install.sh) REPO=https://github.com/MuhammetnurG/Study_Dashboard.git
  ```

- Install from the current local directory (useful for testing):

  ```bash
  bash <(curl -Ls https://github.com/MuhammetnurG/Study_Dashboard/blob/main/install.sh) --local
  ```

- Optional environment variables:
  - `INSTALL_DIR=/opt/study-dashboard` — change install location
  - `--port 8000` — change listening port

Notes for production
- The installer creates a systemd service; you need `sudo` privileges for that.
- It's recommended to front the service with `nginx` and TLS (use Certbot or another ACME client).

Publishing on GitHub

1. Create a new repo on GitHub.
2. Push the project files to the repository.
3. Host `install.sh` (the raw file) at a stable URL (you can use GitHub raw URL or a small CDN).

Security note

Piping a remote script into `bash` runs code from the network with your privileges. Audit the script before running it on production.




