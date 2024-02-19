let ITPpacket = require('./ITPResponse');
let singleton = require('./Singleton');
const path = require("path");
const imagesFolder = path.join(__dirname, 'images');
const fs = require('fs');


module.exports = {
    handleClientJoining: function (sock) {
        console.log('Client ' + sock.remoteAddress + ':' + sock.remotePort + ' joined');
        sock.on('data', function (data) {
            let packet = data.toString('hex');// Convert the buffer to a hex string
            console.log('Received data from client: ' + packet);

            let version = parseBitPacket(data, 0, 4);// Set the ITP version field (V) to 9
            let type = parseBitPacket(data, 4, 2);// Set the response type (Query, Found, Not found, Busy)

            if (version == 9 && type == 0) {
                let fileName = parseFileNameFromPacket(data);
                console.log('Requested filename: ' + fileName);

                // TODO: from here this needs fixing. The file is not being read correctly
                let response = ITPpacket.getPacket(fileName, imagesFolder);
                console.log('Generated response packet: ' + response);

                console.log('Sending data to client: ' + response);
                sock.write(Buffer.from(response, 'hex'));

                fs.readdir(imagesFolder, (err, files) => {
                    if (err) {
                        console.log('Error reading images folder: ' + err);
                    } else {
                        console.log('Images in the folder: ' + files);
                    }
                });
            }

        });

        sock.on('close', function () {// When the client leaves
            console.log('Client ' + sock.remoteAddress + ':' + sock.remotePort + ' left');
        });
    }
};

function parseFileNameFromPacket(data) {
    return data.toString('utf-8').substring(12);
}



//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Returns the integer value of the extracted bits fragment for a given packet
function parseBitPacket(packet, offset, length) {
    let number = "";
    for (var i = 0; i < length; i++) {
        // let us get the actual byte position of the offset
        let bytePosition = Math.floor((offset + i) / 8);
        let bitPosition = 7 - ((offset + i) % 8);
        let bit = (packet[bytePosition] >> bitPosition) % 2;
        number = (number << 1) | bit;
    }
    return number;
}

// Prints the entire packet in bits format
function printPacketBit(packet) {
    var bitString = "";

    for (var i = 0; i < packet.length; i++) {
        // To add leading zeros
        var b = "00000000" + packet[i].toString(2);
        // To print 4 bytes per line
        if (i > 0 && i % 4 == 0) bitString += "\n";
        bitString += " " + b.substr(b.length - 8);
    }
    console.log(bitString);
}

// Converts byte array to string
function bytesToString(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}