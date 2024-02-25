let ITPpacket = require('./ITPResponse');
let singleton = require('./Singleton');
const path = require("path");
const imagesFolder = path.join(__dirname, 'images');
const fs = require('fs');


module.exports = {
    handleClientJoining: function (sock) {
        const clientId = singleton.getRandomInt(1, 999); // Generate a random client ID between 1 and 999
        console.log('\nClient-' + clientId + ' is connected at timestamp: ' + singleton.getTimestamp());
        sock.on('data', function (data) { // When the client sends a packet
            console.log("\nITP packet received:");
            printPacketBit(data);// Print the entire packet in bits format

            const version = parseBitPacket(data, 0, 4);
            const type = parseBitPacket(data, 30, 2);
            const timestamp = singleton.getTimestamp();
            const extension = parseBitPacket(data, 64, 4);
            const fileNameSize = parseBitPacket(data, 68, 28);
            const fileName = bytesToString(data.slice(12, 12 + fileNameSize));

            // Print the client requests
            console.log("\nClient requests:");
            console.log("    --ITP version: " + version);
            console.log("    --Timestamp: " + timestamp);
            console.log("    --Request type: " + getRequestTypeName(type));
            console.log("    --Image file extension(s): " + getExtensionName(extension));
            console.log("    --Image file name: " + fileName);

            // Check if the ITP version is supported
            if (version !== 9) {
                console.log("Unsupported ITP version");
                return;
            }
            // Check if the request type is supported
            if (type !== 0) {
                console.log("Unsupported request type");
                return;
            }

            const response = ITPpacket.getPacket(fileName + "." + getExtensionName(extension), imagesFolder);
            sock.write(response); // Send the response packet
        });

        sock.on('close', function () {// When the client leaves
            console.log('\nClient-' + clientId + ' closed the connection');
        });
    }
};

// Returns the request type name
function getRequestTypeName(type) {
    switch (type) {
        case 0:
            return "Query";
        default:
            return "Unknown";
    }
}
// Returns the image extension name
function getExtensionName(extension) {
    switch (extension) {
        case 1:
            return "png";
        case 2:
            return "bmp";
        case 3:
            return "tiff";
        case 4:
            return "jpeg";
        case 5:
            return "gif";
        case 15:
            return "raw";
        default:
            return null;
    }
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