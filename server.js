const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
mongoose.connect("mongodb+srv://finnworth:stopmakingmedothis@dayone.noh9ita.mongodb.net/?appName=dayone")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// Song model
const SongSchema = new mongoose.Schema({
    name: String,
    artist: String,
    songPath: String,
    imagePath: String,
    createdAt: { type: Date, default: Date.now }
});
const Song = mongoose.model("Song", SongSchema);

// File storage
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        if(file.mimetype.startsWith("audio")){
            cb(null, "uploads/songs/");
        } else {
            cb(null, "uploads/images/");
        }
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Upload a song
app.post("/api/songs", upload.fields([
    { name: "song", maxCount: 1 },
    { name: "image", maxCount: 1 }
]), async (req, res) => {
    try {
        const song = new Song({
            name: req.body.name,
            artist: req.body.artist,
            songPath: req.files["song"][0].path,
            imagePath: req.files["image"] ? req.files["image"][0].path : null
        });
        await song.save();
        res.json(song);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all songs
app.get("/api/songs", async (req, res) => {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
});

// Delete a song
app.delete("/api/songs/:id", async (req, res) => {
    await Song.findByIdAndDelete(req.params.id);
    res.json({ message: "Song deleted" });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));