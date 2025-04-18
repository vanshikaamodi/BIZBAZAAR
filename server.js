const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

dotenv.config();

const app = express();
const port = 3009;

// MongoDB connection string
const uri = 'mongodb+srv://poojarysudhiksha80:su@sudiksha.z7vrd.mongodb.net/bidbazaar?retryWrites=true&w=majority&appName=sudiksha';
let client;

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Connect to MongoDB
async function connectToDB() {
    try {
        client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, tls: true });
        await client.connect();
        console.log("✅ Connected to MongoDB!");
        return client;
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
        setTimeout(connectToDB, 5000);
    }
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Upload folder setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(uploadDir));

// Signup
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const db = client.db("bidbazaar");
        const users = db.collection("users");

        const existingUser = await users.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "❌ User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await users.insertOne({ name, email, password: hashedPassword });

        res.json({ message: "✅ User registered successfully!", userId: result.insertedId });
    } catch (error) {
        console.error("❌ Error signing up:", error);
        res.status(500).json({ message: "❌ Signup failed" });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = client.db("bidbazaar");
        const users = db.collection("users");

        const user = await users.findOne({ email });
        if (!user) return res.status(400).json({ message: "❌ User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "❌ Incorrect password" });

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "5h" });
        res.json({ message: "✅ Login successful!", token });
    } catch (error) {
        console.error("❌ Error logging in:", error);
        res.status(500).json({ message: "❌ Login failed" });
    }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "❌ Access denied. No token provided." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "❌ Invalid token" });
        req.user = user;
        next();
    });
};

// Protected profile route
app.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: "✅ Profile data accessed", user: req.user });
});

// Upload product with files
app.post('/api/products', authenticateToken, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'authProof', maxCount: 1 }
]), async (req, res) => {
    try {
        const { productName, description, price, auctionDuration, otherDetails } = req.body;

        const imageFile = req.files['image']?.[0];
        const authProofFile = req.files['authProof']?.[0];

        if (!imageFile || !authProofFile) {
            return res.status(400).json({ success: false, message: "❌ Files are missing" });
        }

        const newProduct = {
            productName,
            description,
            price: parseFloat(price),
            auctionTiming: auctionDuration,
            otherDetails,
            imageURL: `/uploads/${imageFile.filename}`,
            authProofURL: `/uploads/${authProofFile.filename}`,
            userId: req.user.userId,
            createdAt: new Date()
        };

        const db = client.db("bidbazaar");
        const products = db.collection("products");

        const result = await products.insertOne(newProduct);

        res.json({ success: true, message: "✅ Product added successfully!", productId: result.insertedId });
    } catch (error) {
        console.error("❌ Error uploading product:", error);
        res.status(500).json({ success: false, message: "❌ Failed to upload product" });
    }
});

// Get all products with user info
app.get('/api/auctionListing', async (req, res) => {
    try {
        const db = client.db("bidbazaar");
        const products = db.collection("products");
        const users = db.collection("users");

        const allProducts = await products.find().toArray();

        const productsWithUserDetails = await Promise.all(
            allProducts.map(async (product) => {
                console.log("Product:", product);  // Check product data
                const user = await users.findOne({ _id: product.userId });
                console.log("Seller User:", user);  // Check user data
                return {
                    ...product,
                    sellerName: user?.name || 'Unknown',
                    sellerEmail: user?.email || 'Unknown',
                    auctionDuration: product.auctionTiming || 'N/A'  // Ensure it's being passed correctly
                };
            })
        );

        res.json({ success: true, products: productsWithUserDetails });
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).json({ success: false, message: "❌ Failed to fetch products" });
    }
});
// Dashboard route
app.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const db = client.db("bidbazaar");
        const users = db.collection("users");

        const user = await users.findOne({ email: req.user.email }, { projection: { password: 0 } });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ user });
    } catch (error) {
        console.error("❌ Error fetching user data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



// Place a new bid
app.post('/api/bids', authenticateToken, async (req, res) => {
    try {
        const { productId, bidAmount } = req.body;

        if (!productId || !bidAmount) {
            return res.status(400).json({ success: false, message: "❌ productId and bidAmount are required" });
        }

        const db = client.db("bidbazaar");
        const bids = db.collection("bids");

        const bid = {
            productId,
            bidAmount: parseFloat(bidAmount),
            userId: req.user.userId,
            bidderName: req.user.email, // or req.user.name if you include it in the token
            createdAt: new Date()
        };

        await bids.insertOne(bid);
        res.json({ success: true, message: "✅ Bid placed successfully!" });
    } catch (error) {
        console.error("❌ Error placing bid:", error);
        res.status(500).json({ success: false, message: "❌ Failed to place bid" });
    }
});

// Get all bids for a product (highest first)
app.get('/api/bids/:productId', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.params;

        const db = client.db("bidbazaar");
        const bids = db.collection("bids");

        const productBids = await bids.find({ productId }).sort({ bidAmount: -1 }).toArray();

        res.json({ success: true, bids: productBids });
    } catch (error) {
        console.error("❌ Error fetching bids:", error);
        res.status(500).json({ success: false, message: "❌ Failed to fetch bids" });
    }
});

// Get a single product by ID
app.get('/api/product/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const db = client.db("bidbazaar");
        const products = db.collection("products");

        const product = await products.findOne({ _id: new require('mongodb').ObjectId(id) });

        if (!product) {
            return res.status(404).json({ success: false, message: "❌ Product not found" });
        }

        res.json({ success: true, product });
    } catch (error) {
        console.error("❌ Error fetching product:", error);
        res.status(500).json({ success: false, message: "❌ Failed to fetch product" });
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

