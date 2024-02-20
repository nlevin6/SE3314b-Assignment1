const net = require("net");
const fs = require("fs");
const open = require("open");
const { argv } = require("yargs");

const ITPpacket = require("./ITPRequest");

const serverAddress = argv.s || "127.0.0.1";
const serverPort = parseInt(argv.p) || 3000;
const fileName = argv.q || "";
const version = argv.v || 9;

if (!fileName) {
  console.error("Please provide a valid image file name using -q flag.");
  process.exit(1);
}

const client = new net.Socket();

client.connect(serverPort, serverAddress, function () {
  console.log("Connected to ImageDB server on: " + serverAddress + ":" + serverPort);

  const packet = ITPpacket.getBytePacket(fileName, version);
  client.write(packet);
});

client.on("data", function (data) {
  const packetHeader = data.slice(0, 12);
  console.log("ITP packet received:");
  printPacketBit(packetHeader);

  const responseType = parseBitPacket(data, 4, 2);
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

  const imageSize = parseBitPacket(data, 64, 32);
  const image = data.slice(12, 12 + imageSize);

  fs.writeFileSync("image.gif", image);
  open("image.gif");

  client.destroy();
});

client.on("close", function () {
  console.log("Connection closed");
});

client.on("error", function (err) {
  console.log("Error: " + err.message);
  client.destroy();
});

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
