const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    image: { 
        type: String, 
       
    },
    price:{
        type:Number,
        required:true
    },
    state: {
        type: Boolean,
        default: true 
    }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
