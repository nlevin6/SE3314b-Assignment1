let singleton = require('./Singleton');
const fs = require('fs');
const path = require("path");

module.exports = {

  init: function () { // feel free to add function parameters as needed
    singleton.init();
  },

  //--------------------------
  //getpacket: returns the entire packet
  //--------------------------
  getPacket: function (fileName, imagesFolder) {
    const image = path.join(imagesFolder, fileName);
    const exists = fs.existsSync(image);
    let size = 0;
    if (exists) {
      size = fs.statSync(image).size;
    }

    // Create a buffer to hold the packet. The size of the packet is 12 + the size of the image file
    const packet = Buffer.alloc(12 + size);

    storeBitPacket(packet, 9, 0, 4); // Set the ITP version field (V) to 9
    storeBitPacket(packet, exists ? 1 : 2, 4, 2); // Set the response type (Query, Found, Not found, Busy)
    storeBitPacket(packet, singleton.getSequenceNumber(), 6, 26); // Set the sequence number

    const timestamp = singleton.getTimestamp(); // Get the current timestamp
    storeBitPacket(packet, timestamp, 32, 32); // 32 bits for timestamp

    storeBitPacket(packet, size, 64, 32); // 32 bits for image size

    // store the image into the packet
    if (exists) {
      const imageBuffer = fs.readFileSync(image);
      imageBuffer.copy(packet, 12);
    }

    return packet;
  }
};

//// Some useful methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Store integer value into specific bit position the packet
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