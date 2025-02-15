const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Serve index.html from the root directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
