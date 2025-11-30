const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || process.argv[2] || 8000;

app.use(express.json({ limit: '1mb' }));

const publicDir = path.join(__dirname);
app.use(express.static(publicDir));

const fs = require('fs').promises;
const DATA_FILE = path.join(__dirname, 'data.json');

// Simple JSON-backed API for shared persistence across browsers/devices.
app.get('/api/data', async (req, res) => {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return res.json(parsed);
  } catch (err) {
    // If file doesn't exist, return empty default state
    if (err.code === 'ENOENT') {
      return res.json({ assignments: [], schedule: [], notes: [], studentName: 'Student Name' });
    }
    console.error('Failed to read data file:', err);
    return res.status(500).json({ error: 'Failed to read data' });
  }
});

app.post('/api/data', async (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') return res.status(400).json({ error: 'Invalid payload' });
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), { encoding: 'utf8' });
    return res.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to write data file:', err);
    return res.status(500).json({ error: 'Failed to save data' });
  }
});

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
