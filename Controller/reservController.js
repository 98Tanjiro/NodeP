const Salle = require('../models/salle');
const User = require('../models/user');
const Reservation = require('../models/reservation');

const { sendMail } = require("../config/email");
const reservController = {};

reservController.showReservationPage = async (req, res) => {
    try {
        const salleId = req.params.salleId;
        const salle = await Salle.findById(salleId);
        if (!salle) {
            return res.status(404).json({ message: "Room can't be found " });
        }
        res.render('reservation', { salle: salle, salleId: salleId, successMessage: null, errorMessage: null });
    } catch (error) {
        console.error("Error while showing reservation page");
        res.status(500).send("Error while showing reservation page");
    }
};


reservController.reserveSalle = async (req, res) => {
    console.log(req.body)
    try {
        const { salleId, dateDebut, dateFin } = req.body;
        if (!dateDebut || !req.userId) {
            return res.status(400).json({ message: "Please enter the debut date with client ID" });
        }

        const user = await User.findById(req.userId);
        const salle = await Salle.findById(salleId);
        if (!user || !salle) {
            return res.status(404).json({ message: "User or Room not found" });
        }

        const existingReservation = await Reservation.findOne({ 
            salle: salleId, 
            datedébut: { $lte: dateDebut }, 
            datefin: { $gte: dateFin },
            status: "ongoing" 
        });

        if (existingReservation) {
            return res.render('reservation', { 
                salle: salle,
                name: salle.name, 
                salleId: salleId, 
                successMessage: null,
                errorMessage: "Impossible ... Room already reserved for this period " 
            });
        }

        const reservation = new Reservation({

            room: salle,
            user: req.userId,
            startdate: dateDebut,
            enddate: dateFin,
            status: "ongoing" 
        });
        console.log(reservation)
        await reservation.save();
        salle.state = false ;
        salle.save()
        
        sendMail(user.email, "Added successfully", "Welcome Ms " + user.username + ",\n\nYou have successfully reserved . these are the details :\n\nDebute date : " + dateDebut + "\nEnd date : " + dateFin + ".\n\n Consult the total price in your account ", false);

        console.log(req.cookies.token);
        res.render('clientDashboard', {username:user.username});
        // {salle: salle,
        //     name: salle.name, 
        //     salleId: salleId, 
        //     successMessage: "Successfully reserved !", 
        //     errorMessage: null 
        // });
    } catch (error) {
        console.error("Error while reserving:");
        res.status(500).json({ message: "Error while reserving" });
    }
};

reservController.consultReservations = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found .");
        }
        const username = user.username;
        const reservations = await Reservation.find({ user: userId }).populate('room', 'name price');
        
        reservations.forEach(reservation => {
            const startDate = new Date(reservation.startdate);
            const endDate = new Date(reservation.enddate);
            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            
            if (reservation.room && reservation.room.price) {
                reservation.totalPrice = reservation.room.price * days;
            } else {
                reservation.totalPrice = 0;
            }
        });

        res.render('MesReservations', { username, reservations });
    } catch (error) {
        console.error("Error while consulting reservations");
        res.status(500).send("Error while consulting reservations");
    }
};



reservController.showEditReservationForm = async (req, res) => {
    try {
        const reservationId = req.params.reservationId;

        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            return res.status(404).send('Reservation non existent');
        }

        // Passer les messages d'erreur et de succès à la méthode render
        const errorMessage = req.query.errorMessage;
        const successMessage = req.query.successMessage;

        res.render('editReservation', { reservation, errorMessage, successMessage });
    } catch (error) {
        console.error('Error while showing the modification form');
        res.status(500).send('Error while showing the modification form');
    }
};
reservController.editReservation = async (req, res) => {
    try {
        const reservationId = req.params.reservationId;
        const { startdate, enddate, salleId } = req.body;

        const existingReservation = await Reservation.findOne({ 
            _id: { $ne: reservationId }, // n5arjou id mta3 reservation exicte 
            room: salleId, 
            startdate: { $lte: startdate }, 
            enddate: { $gte: enddate } 
        });

        if (existingReservation) {
            const errorMessage = "Impossible to modify ... another reservation is scheduled in the mean time!";
            return res.render('editReservation', { errorMessage });
        }

        const updatedReservation = await Reservation.findByIdAndUpdate(
            reservationId, 
            { startdate, enddate }, 
            { new: true }
        );
        
        await updatedReservation.save();
       
        const updatedSalle = await Salle.findById(updatedReservation.room);

        const user = await User.findById(req.userId);
        sendMail(user.email, "Modified successfully ", "Dear " + user.username + ",\n\nyour reservation have been made successfully . here are the details of your new reservation :\n\nname of room : " + updatedSalle.name + "\nCity : " + updatedSalle.location + "\nnumber of places: " + updatedSalle.capacity + "\nPrice : " + updatedSalle.prix + "\n\nconsult other details in your account", false);
        const reservations = await Reservation.find();

        const successMessage = "Successfully modified reservation";
        res.render('editReservation', { reservations, reservation: updatedReservation, successMessage });
    } catch (error) {
        console.error("Error while modifying reservation");
        res.status(500).json({ message: "Error while modifying reservation" });
    }
};
reservController.deleteReservation = async (req, res) => {
    try {
        const reservationId = req.params.reservationId;
        await Reservation.findByIdAndDelete(reservationId);
        const user = await User.findById(req.userId);
        sendMail(user.email, "deleted successfully", "dear " + user.username + 
        ",\n\nyou have successfully deleted your reservation .\n\nConsult your account for more details .", false)
        res.redirect('/reservations/MesReservations');
        } catch (error) {
        console.error("Error while deleting reservation :");
        res.status(500).json({ message: "Error while deleting reservation ." });
    }
};

reservController.listeReservationsEnCours = async (req, res) => {
    try {
        const reservationsEnCours = await Reservation.find({ status: "ongoing" })
            .populate('user', 'username') 
            .populate('room', 'name'); 

        res.render('reservationencours', { reservationsEnCours });
    } catch (error) {
        console.error("Error while recupurating");
        res.status(500).json({ message: "Error while recupurating." });
    }
};


module.exports = reservController;
