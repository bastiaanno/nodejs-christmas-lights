const express = require('express');
const { read, realpathSync } = require('fs');
const app = express()
const port = 3000
const http = require('http').Server(app);
const io = require('socket.io')(http);
const pigpio = require('pigpio-client').pigpio({ host: '192.168.2.24', timeout: 5 });
// on disconnect re-initialize pigpio
pigpio.once('disconnected', (reason) => {
    io.emit("gpio disconnected");
    console.log('rcencoder: received disconnect event')
    console.log('rcencoder: re-initializing pigpio')
    pigpio.connect();
});
const ready = new Promise((resolve, reject) => {
    pigpio.once('connected', resolve);
    pigpio.once('error', reject);
    pigpio.once('disconnected', reject);
});

pigpio.once('connected', function() {
    console.log('Connected gpio');
    ready.then(async(info) => {
        await console.log(JSON.stringify(info, null, 2));
        await io.emit('gpio connected');
        const relay = pigpio.gpio(4);
        await relay.read().then(function(callback) {
            io.emit("status", { on: callback });
            console.log("STATUS REQUESTED: Lights are " + (callback ? "on" : "off"));
        });
    });
});
io.on('connection', function(socket) {
    console.log('a user connected');
    io.emit("gpio disconnected");
    ready.then(async() => {
        io.emit("gpio connected");
        const relay = pigpio.gpio(4);
        await relay.read(7).then(function(callback) {
            io.emit("status", { on: callback });
            console.log("SENT STATUS: Lights are " + (callback ? "on" : "off"));
        });
    });
    socket.on('toggle', function(args) {
        ready.then(async() => {
            const relay = pigpio.gpio(4);
            await relay.modeSet('output');
            await relay.read().then(function(callback) {
                relay.write(callback ? 0 : 1);
                console.log('Turned lights ' + (callback ? "off" : "on") + '.');
                io.emit("status", { on: callback ? 0 : 1 });
            });
        });
    });
    socket.on('getStatus', function() {
        ready.then(async() => {
            const relay = pigpio.gpio(4);
            await relay.read().then(function(callback) {
                io.emit("status", { on: callback });
                console.log("STATUS REQUESTED: Lights are " + (callback ? "on" : "off"));
            });
        });
    })
});

http.listen(port, () => {
    console.log(`Server listening at http://ip_address:${port}`);
});

app.use(express.static('public'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});