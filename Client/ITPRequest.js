

// You may need to add some statements here

module.exports = {
  init: function () {
    // You may need to add some statements here
  },

  //--------------------------
  //getBytePacket: returns the entire packet in bytes
  //--------------------------
  getBytePacket: function (fileName, version) {
      let packet = Buffer.alloc(12);
      storeBitPacket(packet, version, 0, 4);// Set the ITP version field (V) to 9
      storeBitPacket(packet, 0, 4, 26);// Reserved 26 bits
      storeBitPacket(packet, 0, 30, 2);// Set the response type query (which is 0)

      let timestamp = Math.floor(Date.now() / 1000);// Get the current timestamp
      storeBitPacket(packet, timestamp, 32, 32);// Set the timestamp

      storeBitPacket(packet, 1, 64, 4);// Set image type field to 1 (PNG)
      let fileNameSize = Buffer.from(fileName).length; // Get the image name length
      storeBitPacket(packet, fileNameSize, 68, 28);// Set the image name length

      let fileNameBytes = Buffer.from(fileName) // Convert the file name to bytes
      fileNameBytes.copy(packet,12); // Copy the file name bytes to the packet

      return packet;
  },
};

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Convert a given string to byte array
function stringToBytes(str) {
  var ch,
    st,
    re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xff); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    } while (ch);
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

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
