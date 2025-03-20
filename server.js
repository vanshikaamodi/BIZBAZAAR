const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3008;

// MongoDB connection string
const uri = "mongodb+srv://poojarysudhiksha80:su@sudiksha.z7vrd.mongodb.net/?retryWrites=true&w=majority&appName=sudiksha";
let client;

// 🔹 Hardcoded JWT Secret Key (Change for Production)
const JWT_SECRET = "supersecretkey123"; 

// Function to connect to MongoDB
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
            await new Promise(res => setTimeout(res, 5000));
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
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadPath));

// 🔹 Signup Route
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const db = client.db("bidbazaar");
        const users = db.collection("users");

        const existingUser = await users.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "❌ Email already exists!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await users.insertOne({ username, email, password: hashedPassword, createdAt: new Date() });

        res.json({ message: "✅ Signup successful!", userId: result.insertedId });
    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).json({ message: "❌ Signup failed!" });
    }
});

// 🔹 Login Route (Token Expiry Set to 7 Days)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = client.db("bidbazaar");
        const users = db.collection("users");

        const user = await users.findOne({ email });
        if (!user) return res.status(400).json({ message: "❌ User not found!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "❌ Invalid credentials!" });

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

        res.json({ message: "✅ Login successful!", token });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "❌ Login failed!" });
    }
});

// 🔹 Middleware to Protect Routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "❌ No token provided." });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("❌ JWT Verification Error:", err);
            return res.status(403).json({ message: "❌ Invalid or expired token." });
        }
        req.user = user;
        next();
    });
};

// 🔹 Refresh Token Route (If Token Expired)
app.post('/refreshToken', authenticateToken, (req, res) => {
    const newToken = jwt.sign({ userId: req.user.userId, email: req.user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token: newToken });
});

// 🔹 Get User Profile (Protected)
app.get('/profile', authenticateToken, async (req, res) => {
    const db = client.db("bidbazaar");
    const users = db.collection("users");

    const user = await users.findOne({ email: req.user.email }, { projection: { password: 0 } });
    if (!user) return res.status(404).json({ message: "❌ User not found" });

    res.json({ user });
});

// 🔹 Add Product Route
app.post('/addProduct', upload.fields([{ name: 'image' }, { name: 'authProof' }]), async (req, res) => {
    try {
        const { productName, description, auctionDuration } = req.body;
        if (!req.files || !req.files['image'] || !req.files['authProof']) {
            return res.status(400).json({ message: "❌ Image and Auth Proof are required!" });
        }

        const imagePath = `/uploads/${req.files['image'][0].filename}`;
        const authProofPath = `/uploads/${req.files['authProof'][0].filename}`;

        const db = client.db("bidbazaar");
        const products = db.collection("products");
        const result = await products.insertOne({
            productName, description, auctionDuration, imagePath, authProofPath, createdAt: new Date()
        });

        res.json({ message: "✅ Product added successfully!", productId: result.insertedId });
    } catch (error) {
        console.error("❌ Error adding product:", error);
        res.status(500).json({ message: "❌ Failed to add product" });
    }
});

// 🔹 Get All Products
app.get('/getProducts', async (req, res) => {
    try {
        const db = client.db("bidbazaar");
        const products = db.collection("products");
        const productList = await products.find({}).toArray();

        res.json(productList.map(product => ({
            ...product,
            imagePath: `http://localhost:${port}${product.imagePath}`,
            authProofPath: `http://localhost:${port}${product.authProofPath}`
        })));
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
