// server.js
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb'); // Import MongoClient from 'mongodb'
const app = express();
const port = process.env.PORT || 3000; // Use Render's PORT env var or default to 3000

// Middleware to enable CORS for all origins (for development)
// IMPORTANT: In production, change '*' to your GitHub Pages URL
app.use(cors());

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// --- MongoDB Connection ---
const uri = process.env.MONGODB_URI; // Your MongoDB connection string
const client = new MongoClient(uri);

async function connectToMongo() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB Atlas!");
    } catch (error) {
        console.error("Failed to connect to MongoDB Atlas:", error);
        // In a real app, you might want to exit the process or retry
    }
}
connectToMongo(); // Connect when the server starts

// --- API Endpoint to receive data for Excel updates ---
app.post('/api/updateExcel', async (req, res) => {
    const { sheetName, row, col, newValue } = req.body;
    console.log(`Received update for: Sheet=<span class="math-inline">\{sheetName\}, Row\=</span>{row}, Col=<span class="math-inline">\{col\}, NewValue\=</span>{newValue}`);

    try {
        // Select your database and collection (like a table in SQL)
        const database = client.db("accounting_data_db"); // Choose a name for your database
        const collection = database.collection("excel_cells"); // Choose a name for your collection

        // Create a unique identifier for each cell (like a composite primary key in SQL)
        const filter = { sheetName: sheetName, row: row, col: col };
        // Define the update operation: set the newValue
        const updateDoc = {
            $set: {
                sheetName: sheetName, // Store these for clarity, even if in filter
                row: row,
                col: col,
                cellValue: newValue // The actual cell value
            },
        };
        // Options: upsert: true means insert if no matching document found, otherwise update
        const options = { upsert: true };

        const result = await collection.updateOne(filter, updateDoc, options);

        console.log('MongoDB operation successful:', result);
        res.json({
            message: 'Data saved successfully!',
            data: { sheetName, row, col, newValue }
        });

    } catch (error) {
        console.error('Error saving data to MongoDB:', error);
        res.status(500).json({
            message: 'Failed to save data to database',
            error: error.message
        });
    }
});

// --- Optional: A simple GET route to check if the server is running ---
app.get('/', (req, res) => {
    res.send('Node.js Backend is running!');
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
