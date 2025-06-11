// server.js
const app = require("./app");
const fs = require("fs");

const PORT = process.env.API_PORT || 3000;
const HOST = process.env.API_HOST || "0.0.0.0";

if (!fs.existsSync("downloads")) fs.mkdirSync("downloads");

app.listen(PORT, HOST,() => {
    console.log(`Server running on ${HOST}:${PORT}`);
});