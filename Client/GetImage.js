const net = require("net");
const fs = require("fs");
const open = require("open");
const {argv} = require("yargs");
const ITPpacket = require("./ITPRequest");

const serverAddressAndPort = argv.s || "127.0.0.1:3000"; // Default server address and port
const [serverAddress, serverPort] = serverAddressAndPort.split(':'); // Split the server address and port
const fileName = argv.q || ""; // Image file name
const version = argv.v || 9;// ITP version

// Check if the file name is provided
if (!fileName) {
    console.error("Please provide a valid image file name using -q flag.");
    process.exit(1);
}

const client = new net.Socket();// Create a new TCP socket

// Connect to the server
client.connect({ port: parseInt(serverPort), host: serverAddress }, function () {
    console.log("Connected to ImageDB server on: " + serverAddress + ":" + serverPort);

    const packet = ITPpacket.getBytePacket(fileName, version); // Create a new ITP packet
    client.write(packet);// Send the ITP packet to the server
});

// Add a 'data' event handler for the client socket
client.on("data", function (data) {
    const packetHeader = data.slice(0, 12); // Extract the packet header
    console.log("\nITP packet received:");
    printPacketBit(packetHeader);

    const responseType = parseBitPacket(data, 4, 2);
    const sequenceNumber = parseBitPacket(data, 16, 16);
    const timestamp = parseBitPacket(data, 32, 32);

    // Print the packet details
    console.log("\nServer sent:");
    console.log("    --ITP version = " + version);
    console.log("    --Response Type = " + getResponseType(responseType));
    console.log("    --Sequence Number = " + sequenceNumber);
    console.log("    --Timestamp = " + timestamp);

    // Check the response types
    if (responseType === 2) {
        console.log("Image not found");
        client.destroy();
        return;
    }
    if (responseType !== 1) {
        console.log("Unsupported response type");
        client.destroy();
        return;
    }

    const imageSize = parseBitPacket(data, 64, 32);// Extract the image size
    const image = data.slice(12, 12 + imageSize); // Extract the image data

    fs.writeFileSync(fileName, image);// Save the image to a file
    open(fileName); // Open the image file

    client.destroy(); // Close the connection
});

// Add a 'close' event handler for the client socket
client.on("close", function () {
    console.log("\nDisconnected from server");
    console.log("Connection closed");
});

// Add an 'error' event handler for the client socket
client.on("error", function (err) {
    console.log("Error: " + err.message);
    client.destroy();
});

// Returns the response type
function getResponseType(type) {
    switch (type) {
        case 0:
            return "Not found";
        case 1:
            return "Found";
        default:
            return "Not Found";
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
