const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const router = require('./Routes/userRouter');
const routersalle = require('./Routes/salleRouter');
const routerreserv = require('./Routes/reservRouter');
const uploadImage = require('./midelware/multer');
const authenticateToken = require('./midelware/authentication') 

const cookieParser = require('cookie-parser');
require('dotenv').config();
const methodOverride = require('method-override');
const User = require('./models/user');


const app = express();
const port = process.env.PORT || 3002;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

(async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/reservation_salle');
        console.log("Connexion réussie avec la base de données");
    } catch (error) {
        console.log(error.message);
    }
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static('public'));
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Utilisation du routeur pour gérer les routes utilisateur sans préfixe
app.use('/users', router);
app.use('/salle', routersalle);
app.use('/reservations', routerreserv);
app.get('/',(req,res)=>{
    res.render('welcome');
})


app.get('/dashboard',authenticateToken, async(req,res )=>{
    console.log(req.userId)
    const user = await User.findById(req.userId)
    const isAdmin = user.role === 'admin';
    if (isAdmin){
    res.render('adminDashboard' , { username: user.username });
    }
    else {res.render( 'clientDashboard', { username: user.username });}
})

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});
