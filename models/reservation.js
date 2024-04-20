const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    startdate: {
        type: Date,
        required: true
    },
    enddate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['ongoing', 'ended', 'cancelled', 'waiting']
    },
   
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
