let time = 0;
let sequenceNumber = 0;

module.exports = {
    init: function () {
        sequenceNumber = getRandomInt(1, 999);
        time = getRandomInt(1, 999);
    },

    //--------------------------
    //getSequenceNumber: return the current sequence number + 1
    //--------------------------
    getSequenceNumber: function () {
        sequenceNumber++;
        return sequenceNumber;
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function () {
        return time;
    },

    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};
// setInterval is used to update the time every 10ms
setInterval(tick, 10);


function tick() {
    //if the timer reaches 2^32, reset it to 1
    if (time === Math.pow(2, 32)) {
        time = Math.ceil(Math.random() * 999);
    }
    time++;

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}