// server.js
const express = require('express');
const cors = require('cors'); // Import the cors package
const app = express();
const port = process.env.PORT || 3000; // Use environment variable PORT or default to 3000

// Middleware to enable CORS for all origins (for development)
// For production, you'll want to restrict this to your GitHub Pages domain
app.use(cors());

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// --- API Endpoint to receive data for Excel updates ---
// This will be the endpoint your frontend sends data to
app.post('/api/updateExcel', (req, res) => {
    const receivedData = req.body; // The data sent from your frontend

    console.log('Received data for Excel update:', receivedData);

    // --- IMPORTANT: This is where you will add your MySQL logic later ---
    // For now, we'll just simulate a successful save.
    // In the next steps, you'll replace this with actual MySQL INSERT/UPDATE operations.
    // Example:
    // try {
    //     // const connection = await mysql.createConnection(...);
    //     // await connection.execute('INSERT INTO your_table (col1, col2) VALUES (?, ?)', [receivedData.value1, receivedData.value2]);
    //     // await connection.end();
    //     res.json({ message: 'Data received and simulated as saved!', data: receivedData });
    // } catch (error) {
    //     console.error('Error saving to database:', error);
    //     res.status(500).json({ message: 'Failed to save data', error: error.message });
    // }
    // ------------------------------------------------------------------

    res.json({ message: 'Data received and simulated as saved!', data: receivedData });
});

// --- Optional: A simple GET route to check if the server is running ---
app.get('/', (req, res) => {
    res.send('Node.js Backend is running!');
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
