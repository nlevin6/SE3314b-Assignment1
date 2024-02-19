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
    console.log("Connected to server");

    const packet = ITPpacket.getBytePacket(fileName, version);
    console.log("Sending request for image: " + fileName);
    client.write(packet);
});

client.on("data", function (data) {
    const packet = data.toString("hex");
    const imageSize = parseBitPacket(data, 64,32);
    console.log("Received data from server: " + packet);

    // extract image data from the packet and save it to a file
    const type = parseBitPacket(data, 8, 2);
    if (type > 0 && type <= 5) {
        let image = data.slice(12, 12 + imageSize);
        let extension = getImageExtension(type);
        fs.writeFileSync(fileName + extension, image);
        console.log("Image received and saved to file: " + fileName + extension);
        open(fileName + extension);
    } else {
        console.log("Image not found");
    }

    client.destroy();
});

client.on("close", function () {
    console.log("Connection closed");
});

client.on("error", function (err) {
    console.log("Error: " + err.message);
    client.destroy();
});

// Returns the integer value of the extracted bits fragment for a given packet
function parseBitPacket(packet, offset, length) {
    let number = 0;
    for (let i = 0; i < length; i++) {
        let bytePosition = Math.floor((offset + i) / 8);
        let bitPosition = 7 - ((offset + i) % 8);
        let bit = (packet[bytePosition] >> bitPosition) & 1;
        number = (number << 1) | bit;
    }
    return number;
}

function getImageExtension(type) {
    switch (type) {
        case 1:
            return ".gif";
        case 2:
            return ".bmp";
        case 3:
            return ".tiff";
        case 4:
            return ".jpeg";
        case 5:
            return ".gif";
        default:
            return ".dat"; // You may choose a default extension or handle it differently
    }
}
