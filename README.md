# DayOne

## Overview
DayOne is a workout music library application. It uses a web interface, a Node.js and Express backend, and MongoDB to manage song data.

## Requirements
- Node.js and npm
- Access to a MongoDB database
- The project source code

## Setup and run instructions
1. Download or clone this repository.
2. Install Node.js if it is not already installed.
3. Open a terminal in the project folder.
4. Run `npm install` to install the project dependencies.
5. Create a `.env` file in the project folder.
6. Add your MongoDB connection string as `MONGODB_URI=your_connection_string`.
7. Make sure the MongoDB database is accessible.
8. Run `node server.js`.
9. Open `http://localhost:3000` in your browser.

## Configuration and security
The `.env` file contains private configuration and must not be uploaded to GitHub. Each person running the application must configure their own MongoDB connection string.

## Technologies
- HTML, CSS and JavaScript
- Node.js and Express
- MongoDB and Mongoose
- Multer and CORS
