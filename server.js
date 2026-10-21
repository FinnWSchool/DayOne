
 // This part of my javascript loadss the tools for my server

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

// This is creating my servr
const app = express();

// I Set up rules so frontend and files work properly
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// My programme Connecteds to MongoDB
// Set mongodb_uri as an environment variable before starting the server.
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB connection failed:", err.message));


// This is my second Complex Technique 2: DATABASE AND STRUCTURED DATA
// It works as Mongoose defines a schema for each song and uses MongoDB
// to store and retrieve the song's records persistently.
// This works for my DayOne because song names, artists,
// file paths and creation dates are available
// after the application is restarted.

const songSchema = new mongoose.Schema({
    name: String,
    artist: String,
    songPath: String,
    imagePath: String,
    createdAt: { type: Date, default: Date.now }
});

// This creates the Song model so I can use the schema to work with song records in MongoDB.
const Song = mongoose.model("Song", songSchema);


// This is my first Complex Technique 1: FILE HANDLING
// This is where Multer processes the people who use my app's uploaded audio files and cover images.
// Their files are stored in separate folders based on their file type like (mp3,jpeg/png)
// and unique filenames are generated using the current time of day.
// This works for my DayOne app as audio and images
// need to be stored and accessed separately.

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // This separates audio files from the other uploaded files.
        if (file.mimetype.startsWith("audio/")) {
            cb(null, "uploads/songs/");
        } else {
            cb(null, "uploads/images/");
        }
    },

    filename: function(req, file, cb) {
        // This adds the original file extension to a timestamp so filenames cant clash with one another
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// This connects my file storage settings to Multer so it can handle uploaded files.
const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024 // this means only 20MB maximum
    },
    fileFilter: function(req, file, cb) {
        if (file.fieldname === "song" &&
            !file.mimetype.startsWith("audio/")) {
            return cb(new Error(
                "Please select an audio file, such as an MP3, for your song."
            ));
        }

        if (file.fieldname === "image" &&
            !file.mimetype.startsWith("image/")) {
            return cb(new Error(
                "Please select an image file for your cover image."
            ));
        }

        cb(null, true);
    }
});

// This is the uploading song API that I implemented through research with AI.
app.post("/api/songs", (req, res, next) => {
    upload.fields([
        { name: "song", maxCount: 1 },
        { name: "image", maxCount: 1 }
    ])(req, res, function(err) {
        if (err) {
            if (err instanceof multer.MulterError &&
                err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    error: "File is too large. Please choose a file smaller than 20 MB."
                });
            }

            return res.status(400).json({
                error: err.message ||
                    "The upload failed. Please check your selected files."
            });
        }

        next();
    });
}, async (req, res) => {
    try {
        // This gets the uploaded audio file so I can check it before saving the song.
        const songFile = req.files?.song?.[0];

        // This checksthat a song and song name have been provided
        if (!songFile || !req.body.name?.trim()) {
            // This stops the upload if the required information is missing.
            return res.status(400).json({
                error: "Please provide a song file and song name."
            });
        }

        // This creates a new song record using the details entered by the user and the uploaded file paths.
        const song = new Song({
            name: req.body.name.trim(),
            artist: req.body.artist?.trim() || "Unknown Artist",
            songPath: songFile.path,
            imagePath: req.files?.image?.[0]?.path || null
        });

        // This saves the song details to MongoDB and sends the saved record back to the frontend.
        await song.save();
        res.json(song);
    } catch (err) {
        // This logs any errors that happen while trying to delete a song.
        console.error("Failed to upload song:", err);
        res.status(500).json({ error: "Failed to upload song." });
    }
});

// Gets all the songs
app.get("/api/songs", async (req, res) => {
    try {
        // This gets the saved songs and puts the newest ones first in the library.
        const songs = await Song.find().sort({ createdAt: -1 });

        // This sends the song records back so the frontend can display them.
        res.json(songs);
    } catch (err) {
        // This helps me identify problems if the library cannot load its songs.
        console.error("Failed to load songs:", err);
        res.status(500).json({ error: "Failed to load songs." });
    }
});

// User can delete a song
app.delete("/api/songs/:id", async (req, res) => {
    try {
        // This uses the song's unique database ID to find and delete the correct record.
        const song = await Song.findByIdAndDelete(req.params.id);

        if (!song) {
            // This returns an error if the ID does not match a saved record.
            return res.status(404).json({ error: "Song not found." });
        }

        // This confirms that the database record has been deleted.
        res.json({ message: "Song deleted" });
    } catch (err) {
        // This logs any errors that happen while trying to delete a song.
        console.error("Failed to delete song:", err);
        res.status(500).json({ error: "Failed to delete song." });
    }
});

// This starts the server on port 3000 so the frontend can send requests to it.
app.listen(3000, "0.0.0.0", () => {
    console.log("Server running");
});
