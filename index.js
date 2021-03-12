//Require dotenv and initialize with default config in order to use env vars
require('dotenv').config();
const path = require('path');
const http = require('http');
const cors = require('cors');
const express = require('express');
const socketio = require('socket.io');
const morgan = require('morgan');
const { default: axios } = require('axios');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    next();
});

const server = http.createServer(app);
const io = socketio(server, { cors: { origin: '*' } });
// Server listening
const port = process.env.PORT || 8001;
server.listen(port, () => {
    console.log(`Hi! your server is running at port: ${port}`)
})

io.on('connection', (client) => {
    console.log(`New connection: ${new Date()}`)
    io.emit("message", { message: 'Hello there' });

    io.on('data', (payload) => {
        console.log("Message recieved")
        console.log(payload)

        axios.post('https://api.envia.com/ship/generate', {
            Headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SHIPPING_API_KEY}` 
            }
        })
        .then(res => {
            const resdata = res.data;
            console.log(resdata);
            io.emit('message', resdata.data);
        })
        .catch(err => {
            console.log('message', { error: err });
        })
    });
})

