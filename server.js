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

// --- API Endpoint to receive data for Excel updates (POST) ---
app.post('/api/updateExcel', async (req, res) => {
    try {
        const updates = req.body;
        // *** ADD THIS LOG ***
        console.log('Backend: Received updates (from frontend):', updates); 

        const updateResults = [];
        for (const update of updates) {
            // *** ADD THIS LOG ***
            console.log('Backend: Processing individual update:', update); 

            // Validate incoming data (keep this validation)
            if (update.sheetName === undefined || update.row === undefined || update.col === undefined || update.cellValue === undefined) {
                console.warn('Backend: Skipping invalid update due to missing fields:', update);
                continue; 
            }

            const query = {
                sheetName: update.sheetName.trim(), 
                row: update.row,
                col: update.col
            };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    cellValue: update.cellValue 
                }
            };

            const result = await excelCellsCollection.updateOne(query, updateDoc, options);
            updateResults.push(result);
        }
        res.status(200).json({ message: 'Update successful', data: {}, modifiedCount: updateResults.reduce((acc, r) => acc + r.modifiedCount, 0), upsertedCount: updateResults.reduce((acc, r) => acc + r.upsertedCount, 0) });
    } catch (error) {
        console.error('Backend: Error updating Excel data:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// --- NEW API Endpoint to retrieve all saved Excel data (GET) ---
app.get('/api/getExcelData', async (req, res) => {
    try {
        const database = client.db("accounting_data_db");
        const collection = database.collection("excel_cells");

        // Fetch all documents from the collection
        const savedData = await collection.find({}).toArray();

        // Send the fetched data as a JSON response
        res.json(savedData);

    } catch (error) {
        console.error('Error retrieving data from MongoDB:', error);
        res.status(500).json({
            message: 'Failed to retrieve data from database',
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