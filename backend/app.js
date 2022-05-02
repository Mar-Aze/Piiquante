//installation express
const express = require('express');
const app = express();

//installation .env
require('dotenv').config();

//To parse incoming JSON requests and put the parsed data in req.body.
app.use(express.json());

//Bodyparser
const bodyParser = require("body-parser")
app.use(bodyParser.json());

//installation mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//Gestion du CORS pour que nos deux serveurs puissent communiquer entre eux
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

//Gestion des images
const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'images')));

//Lien vers les routes pour les sauces
const sauceRoutes = require('./routes/sauce');
app.use('/api/sauces', sauceRoutes);

//Lien vers les routes pour les utilisateurs
const userRoutes = require('./routes/users');
app.use('/api/auth', userRoutes);



/*//test
app.use((req, res) => {
  res.json({ message: 'Votre requête a bien été reçue !' }); 
});*/



module.exports = app;