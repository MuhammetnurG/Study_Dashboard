# Study Dashboard

[![Project Status](https://img.shields.io/badge/status-active-brightgreen)](https://github.com/MuhammetnurG/Study_Dashboard)

A clean, minimal dashboard to track study sessions, goals, and progress. Study Dashboard helps learners plan sessions, log time, visualize progress, and stay motivated through data-driven insights.

## Features
- Create, edit, and delete study sessions and goals
- Track time spent per subject or topic
- Visualize progress with charts (daily/weekly/monthly)
- Export and import study data (CSV/JSON)
- Simple, responsive Web UI



Example:
- Frontend: Tailwind CSS
- Backend: Node.js + Express
- Database: Local Storage

## Getting Started
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








