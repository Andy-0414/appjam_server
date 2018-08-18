const express = require('express');
const app = express();

app.listen(80, () => {
    console.log("SERVER OPEN");
})
app.get('/', (req, res) => {
    res.send("Test Server");
})