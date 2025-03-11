const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

dotenv.config(); // Load environment variables

const app = express();
const port = 3008;

// MongoDB connection string (Keep as is)
const uri = "mongodb+srv://poojarysudhiksha80:su@sudiksha.z7vrd.mongodb.net/?retryWrites=true&w=majority&appName=sudiksha";
if (!uri) {
    console.error("❌ MONGO_URI is missing in .env file!");
    process.exit(1);
}

let client;

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // Change this in production

// Function to connect to MongoDB with retry logic
async function connectToDB(retries = 5) {
    while (retries > 0) {
        try {
            client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, tls: true });
            await client.connect();
            console.log("✅ Connected to MongoDB!");
            return client;
        } catch (error) {
            console.error(`❌ MongoDB connection failed. Retries left: ${retries - 1}`, error);
            retries--;
            await new Promise(res => setTimeout(res, 5000)); // Wait before retrying
        }
    }
    console.error("❌ Could not connect to MongoDB after multiple retries.");
    process.exit(1);
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads
const uploadPath = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadPath, { recursive: true }); // Ensure 'uploads' folder exists

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadPath)); // Serve uploaded images

// Route to add product for auction
app.post('/addProduct', upload.fields([{ name: 'image' }, { name: 'authProof' }]), async (req, res) => {
    try {
        const { productName, description, auctionDuration } = req.body;
        
        if (!req.files || !req.files['image'] || !req.files['authProof']) {
            return res.status(400).json({ message: "❌ Image and Auth Proof are required!" });
        }

        // Use relative paths for images
        const imagePath = `/uploads/${req.files['image'][0].filename}`;
        const authProofPath = `/uploads/${req.files['authProof'][0].filename}`;

        const db = client.db("bidbazaar");
        const products = db.collection("products");

        const result = await products.insertOne({
            productName,
            description,
            auctionDuration,
            imagePath,
            authProofPath,
            createdAt: new Date()
        });

        res.json({ message: "✅ Product added successfully!", productId: result.insertedId });
    } catch (error) {
        console.error("❌ Error adding product:", error);
        res.status(500).json({ message: "❌ Failed to add product" });
    }
});

// Route to get all auction products
app.get('/getProducts', async (req, res) => {
    try {
        const db = client.db("bidbazaar");
        const products = db.collection("products");
        const productList = await products.find({}).toArray();

        // Convert relative paths to absolute URLs
        const updatedProducts = productList.map(product => ({
            ...product,
            imagePath: `http://localhost:${port}${product.imagePath}`,
            authProofPath: `http://localhost:${port}${product.authProofPath}`
        }));

        res.json(updatedProducts);
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).json({ message: "❌ Failed to fetch products" });
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log("\n🔴 Closing MongoDB connection...");
    if (client) await client.close();
    process.exit(0);
});

// Start server
app.listen(port, async () => {
    await connectToDB();
    console.log(`🚀 Server running on http://localhost:${port}`);
});
