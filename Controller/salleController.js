const jwt = require('jsonwebtoken');
const Salle=require('../models/salle')
const User = require('../models/user');
const uploadImage= require('../midelware/multer')

const salleController={};
const salleDisponibleController = {};

salleController.showAjouterSallePage = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).send('Authentication failed: invalid token');
        }
        
      
        
        res.render('ajoutersalle'); 
    } catch (error) {
        console.error('Error while adding room :');
        res.status(500).send('Error while adding room :');
    }
};
salleController.addsalle = async (req, res) => {
    console.log(req.body)
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).send('Authentication failed: invalid token');
        }

        const { name, capacity, location,price } = req.body;
        let image='';
        if (req.file) {
            image = 'http://localhost:3002/uploads/' + req.file.filename;
        }
       
        const newSalle = new Salle({
            name,
            capacity,
            location,
            price,
            image, // Stocker le chemin de l'image dans la base de données
            state: true
        });

        await newSalle.save();
        res.redirect('/salle/listesalle');
    } catch (error) {
        console.error("Error while saving room:");
        res.status(500).send("Error while saving room:");
    }
};
salleController.getAllSalles = async (req, res) => {
    try {
        const salles = await Salle.find({}, 'name capacity location image price state'); 
        const availableSallesCount = salles.length;
        res.render('listesalle', { salles, availableSallesCount, req });
    } catch (error) {
        console.error("Error while getting rooms !");
        res.status(500).send("Error while getting rooms !");
    }
};


salleController.deleteSalle = async (req, res) => {
    const salleId = req.params.id;
    try {
        const salle = await Salle.findById(salleId);
        if (!salle) {
            return res.status(404).json({ message: "Room is not found ." });
        }
        await Salle.deleteOne({ _id: salleId });
        res.redirect('/salle/listesalle?success=La%20salle%20a%20été%20supprimée%20avec%20succès.');
    } catch (error) {
        console.error("Error while deleting room ! ");
        res.status(500).json({ message: "Error while deleting room ! " });
    }
};
salleController.showEditSallePage = async (req, res) => {
    try {
        const salleId = req.params.id;
        const salle = await Salle.findById(salleId);
        if (!salle) {
            return res.status(404).json({ message: "Room not found ! " });
        }
        
        res.render('editSalle', { salle });
    } catch (error) {
        console.error("Error while modifying room ! ");
        res.status(500).json({ message: "Error while modifying room ! " });
    }
};

salleController.editSalle = async (req, res) => {
    const salleId = req.params.id;
    try {
        const salle = await Salle.findById(salleId);
        if (!salle) {
            return res.status(404).json({ message: "Room not found " });
        }
        salle.name = req.body.name;
        salle.location = req.body.location;
        salle.capacity = req.body.capacity;
        salle.prix= req.body.prix;
        salle.state = req.body.state;
       
        if (req.file) {
            salle.image = 'http://localhost:3002/uploads/' + req.file.filename;
        }
        await salle.save();
       
        res.redirect('/salle/listesalle?success=La%20salle%20a%20été%20modifiée%20avec%20succès.');
    } catch (error) {
        console.error("Error while modifying room !");
        res.status(500).json({ message: "Error while modifying room !" });
    }
};


salleDisponibleController.renderSalleDisponible = async (req, res) => {
    try {
        const salles = await Salle.find({}); 
       
       
        res.render('salledisponible', { salles: salles });
    } catch (error) {
        console.error("Error while looking for available rooms :");
        res.status(500).send("Error while looking for available rooms :");
    }
};





module.exports = {
    salleController,
    salleDisponibleController
};