const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- SCHEMAS ---
const novelSchema = new mongoose.Schema({
    title: String, 
    author: String, 
    description: String, 
    coverImage: String, 
    ratings: [{ username: String, score: Number }], // ობიექტების მასივი
    chapters: [{ title: String, content: String }], 
    createdAt: { type: Date, default: Date.now }
});
const Novel = mongoose.model('Novel', novelSchema);

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    nickname: { type: String, default: '' },
    profilePicture: { type: String, default: '' }
});
const User = mongoose.model('User', userSchema);

const commentSchema = new mongoose.Schema({
    targetId: String, 
    username: String, 
    nickname: String, 
    profilePicture: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
});
const Comment = mongoose.model('Comment', commentSchema);

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ROUTES ---

// 1. Novels Fetching
app.get('/api/novels', async (req, res) => {
    try {
        const novels = await Novel.find().sort({ createdAt: -1 });
        res.json(novels);
    } catch (err) {
        res.status(500).json({ message: "Error fetching novels" });
    }
});

app.get('/api/novels/:id', async (req, res) => {
    try {
        const novel = await Novel.findById(req.params.id);
        if (!novel) return res.status(404).json({ message: "Novel not found" });
        res.json(novel);
    } catch (err) {
        res.status(500).json({ message: "Error fetching novel details" });
    }
});

// 2. Rating Logic (Fixed Validation)
app.post('/api/novels/:id/rate', async (req, res) => {
    try {
        const { rating, username } = req.body;
        const novel = await Novel.findById(req.params.id);
        if (!novel) return res.status(404).json({ message: "Novel not found" });

        // ვშლით ძველ რეიტინგს ამ მომხმარებლისგან
        novel.ratings = novel.ratings.filter(r => r.username !== username);
        // ვამატებთ ახალს როგორც ობიექტს
        novel.ratings.push({ username, score: Number(rating) });

        await novel.save();
        res.json({ ratings: novel.ratings });
    } catch (err) {
        res.status(500).json({ message: "Error saving rating" });
    }
});

// 3. Comments Logic
app.get('/api/comments/:targetId', async (req, res) => {
    const comments = await Comment.find({ targetId: req.params.targetId }).sort({ createdAt: -1 });
    res.json(comments);
});

app.post('/api/comments', async (req, res) => {
    const { targetId, username, text } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "User not found" });

    const newComment = new Comment({
        targetId,
        username,
        nickname: user.nickname || user.username,
        profilePicture: user.profilePicture || 'https://via.placeholder.com/150',
        text
    });
    await newComment.save();
    res.status(201).json(newComment);
});

// 4. User Profile
app.get('/api/users/profile/:username', async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
});

app.put('/api/users/profile/:username', async (req, res) => {
    const { nickname, profilePicture } = req.body;
    if (nickname) {
        const existing = await User.findOne({ nickname, username: { $ne: req.params.username } });
        if (existing) return res.status(400).json({ message: "ნიკნეიმი დაკავებულია" });
    }
    await User.findOneAndUpdate({ username: req.params.username }, { nickname, profilePicture });
    res.json({ message: "Profile updated" });
});

// 5. Auth
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).send("Registered");
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    res.json({ user: user.username, role: user.role });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));