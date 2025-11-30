const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || process.argv[2] || 8000;

const publicDir = path.join(__dirname);
app.use(express.static(publicDir));

// Serve the main dashboard file at the root URL. If your file is named
// differently (e.g. `index.html`) this is unnecessary — rename as desired.
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'study_dashboard.html'));
});

// SPA fallback: serve the dashboard for any other GET path that isn't a static asset.
app.get('*', (req, res) => {
  // If the request looks like a file (has an extension), let static middleware handle it (404 if missing)
  if (path.extname(req.path)) return res.status(404).end();
  res.sendFile(path.join(publicDir, 'study_dashboard.html'));
});

app.listen(port, () => {
  console.log(`Study Dashboard static server listening on port ${port}`);
});
