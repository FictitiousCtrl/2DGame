const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080; // Make sure the port matches your setup

// Serve static files from build folder
app.use('/build', express.static(path.join(__dirname, 'build')));

// Serve index.html from the root directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
