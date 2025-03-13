const express = require("express");
const app = express();

// serve up production assets
app.use(express.static("./build/"));

// let the react app handle any unknown routes
// serve up the index.html if express doesn't recognize the route
const path = require("path");
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "build/index.html"));
});

const PORT = 5000;

console.log("server started on port:", PORT);
app.listen(PORT);