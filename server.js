const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || process.argv[2] || 8000;

const publicDir = path.join(__dirname);
app.use(express.static(publicDir));

app.listen(port, () => {
  console.log(`Study Dashboard static server listening on port ${port}`);
});
