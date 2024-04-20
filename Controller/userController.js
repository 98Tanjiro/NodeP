const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
// const Role = require('../models/role');

const userController = {};

userController.registerForm = async (req, res) => {
    res.render('register', { errorMessage: null, successMessage: null });
};

userController.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || username.trim() === '') {
            return res.render('register', { errorMessage: "Le champ nom d'utilisateur est requis.", successMessage: null });
        }

        if (!password || password.trim() === '') {
            return res.render('register', { errorMessage: "Le champ mot de passe est requis.", successMessage: null });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { errorMessage: "Cet email est déjà utilisé.", successMessage: null });
        }

        // const selectedRole = await Role.findOne({ name: role });
        // if (!selectedRole) {
        //     return res.render('register', { errorMessage: "Le rôle sélectionné n'existe pas.", successMessage: null });
        // }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role:"client"
        });
        await newUser.save();

        res.render('login', { successMessage: "Inscription réussie.", errorMessage: null});
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        res.render('register', { errorMessage: "Erreur lors de l'inscription.", successMessage: null });
    }
};
userController.loginForm = async (req, res) => {
    res.render('login', { errorMessage: null, successMessage: null });
};
userController.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }); 
        if (!user) {
            return res.render('login', { errorMessage: "Please check your Email or Password !!" });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.render('login', { errorMessage: "Please check your Email or Password !!" });
        }
        const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        console.log("Token:", token);
        res.cookie('token', token)
        const isAdmin = user.role === 'admin';
        if (isAdmin){
        res.render('adminDashboard' , { username: user.username });
        }
        else {res.render( 'clientDashboard', { username: user.username });}
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({ errorMessage: "Erreur lors de la connexion." });
    }
};
userController.renderDashboard = async (req, res) => {
    res.render('dashboard', { username: req.user.username });
};

userController.renderWelcome = async (req, res) => {
    res.render('welcome', { username: req.user.username });
};

userController.logout = (req, res) => {
    res.clearCookie('token'); 
    res.redirect('/users/login');
};



module.exports = userController;
