let time = 0;
let sequenceNumber = 0;

module.exports = {
    init: function() {
        sequenceNumber = getRandomInt(1,999);
        time = getRandomInt(1,999);
    },

    //--------------------------
    //getSequenceNumber: return the current sequence number + 1
    //--------------------------
    getSequenceNumber: function() {
      sequenceNumber++;
      return sequenceNumber;
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function() {
        time = Math.floor(Date.now() / 1000);
        return time;
    }
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}