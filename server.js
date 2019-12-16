
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use("/scripts", express.static("scripts"));
app.use("/assets", express.static("assets"));

app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));

app.listen(port, () => {
    console.log('Server connected at:',port);
});
