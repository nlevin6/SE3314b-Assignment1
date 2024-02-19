let singleton = require('./Singleton');
const fs = require('fs');

module.exports = {

    init: function () { // feel free to add function parameters as needed
        singleton.init();
    },

    //--------------------------
    //getpacket: returns the entire packet
    //--------------------------
    getPacket: function (fileName) {
        let packet = Buffer.alloc(12);// Create a buffer to store the ITP response packet
        storeBitPacket(packet, 9, 0, 4);// Set the ITP version field (V) to 9
        storeBitPacket(packet, 0, 4, 2);// Set the response type (Query, Found, Not found, Busy)
        storeBitPacket(packet, singleton.getSequenceNumber(), 6, 26); // Set the sequence number

        let timestamp = singleton.getTimestamp(); // Get the current timestamp
        storeBitPacket(packet, timestamp, 32, 32);// 32 bits for timestamp

        let fileNameBytes = Buffer.from(fileName); // Read the image file
        let fileNameLength = fileNameBytes.length; // Get the image name length

        // Set the image size
        let imageSize = fs.statSync('images/' + fileName).size; // Get the image size
        storeBitPacket(packet, imageSize, 64, 32); // 32 bits for image size
        storeBitPacket(packet, fileNameLength, 96, 4); // Set image type field to 1 (PNG)
        fileNameBytes.copy(packet, 128, 0, fileNameLength); // Copy the file name bytes to the packet

        return packet.toString('hex'); // Convert the buffer to a hex string
    }
};

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Store integer value into specific bit poistion the packet
function storeBitPacket(packet, value, offset, length) {
    // let us get the actual byte position of the offset
    let lastBitPosition = offset + length - 1;
    let number = value.toString(2);
    let j = number.length - 1;
    for (var i = 0; i < number.length; i++) {
        let bytePosition = Math.floor(lastBitPosition / 8);
        let bitPosition = 7 - (lastBitPosition % 8);
        if (number.charAt(j--) == "0") {
            packet[bytePosition] &= ~(1 << bitPosition);
        } else {
            packet[bytePosition] |= 1 << bitPosition;
        }
        lastBitPosition--;
    }
}