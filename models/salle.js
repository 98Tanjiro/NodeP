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
        default: true // Par défaut, la salle est disponible
    }
});

const Room = mongoose.model('Salle', roomSchema);

module.exports = Room;
