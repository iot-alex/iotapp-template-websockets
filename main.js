/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

/*

*/

var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK console
//var myOnboardLed = new mraa.Gpio(3, false, true); //LED hooked up to digital pin (or built in pin on Galileo Gen1)
var myOnboardLed = new mraa.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
myOnboardLed.dir(mraa.DIR_OUT); //set the gpio direction to output
var ledState = true; //Boolean to hold the state of Led

var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var connectedUsersArray = [];
var userId;

app.get('/', function(req, res) {
    //Join all arguments together and normalize the resulting path.
    res.sendFile(path.join(__dirname + '/client', 'index.html'));
});

//Allow use of files in client folder
app.use(express.static(__dirname + '/client'));
app.use('/client', express.static(__dirname + '/client'));

//Socket.io Event handlers
io.on('connection', function(socket) {
    if(connectedUsersArray.length > 0) {
        for(var i = 0; i < connectedUsersArray.length; i++) {
            if(connectedUsersArray[i] !== ('u' + connectedUsersArray.length)){
                console.log("user name no used");
                userId = 'u' + connectedUsersArray.length;
            }
            else {
                console.log("user name already in use");
                userId = 'u' + (connectedUsersArray.length + 1);
            }
        }
    }
    else {
        userId = "u0";
    }
    console.log('a user connected: '+userId);
    io.emit('user connect', userId);
    connectedUsersArray.push(userId);
    console.log('Number of Users Connected ' + connectedUsersArray.length);
    console.log('User(s) Connected: ' + connectedUsersArray);
    io.emit('connected users', connectedUsersArray);
    
    socket.on('user disconnect', function(msg) {
        console.log('remove: ' + msg);
        connectedUsersArray.splice(connectedUsersArray.lastIndexOf(msg), 1);
        io.emit('user disconnect', msg);
    });
    
    socket.on('chat message', function(msg) {
        io.emit('chat message', msg);
        console.log('message: ' + msg.value);
    });
    
    socket.on('toogle led', function(msg) {
        myOnboardLed.write(ledState?1:0); //if ledState is true then write a '1' (high) otherwise write a '0' (low)
        msg.value = ledState;
        io.emit('toogle led', msg);
        ledState = !ledState; //invert the ledState
    });
    
});


remoteIPAdress = http.listen(3000, function(){
    console.log('Web server Active listening on *:3000');
});