
const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée!'}))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {  
  Sauce.findOne({
      _id: req.params.id
    }).then(
      (onesauce) => {
        res.status(200).json(onesauce);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  };
  
  exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce modifiée!'}))
      .catch(error => res.status(400).json({ error }));
  };
   
  
 exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        if (!sauce) {
          res.status(404).json({
            error: new Error("Cette sauce n'existe pas!")
          });
        }
        if (sauce.userId !== req.auth.userId) {
          res.status(403).json({
            error: new Error('Requête non autorisée!')
          });
        } else {
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id })
              .then(() => res.status(204).end())
              .catch(error => res.status(400).json({ error }));
          });
        }
      })
  };


  
  exports.getAllSauce = (req, res, next) => {
    Sauce.find().then(
      (sauces) => {
        res.status(200).json(sauces);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

  exports.likeSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            let mongoReq = null
            let message = ''
            if (req.body.like === 0) {
                if (sauce.usersLiked.includes(req.body.userId)) {
                    mongoReq = {
                        $inc: {likes: -1},
                        $pull: {usersLiked: req.body.userId}
                    }
                    message = 'Like cancelled!'
                }
                if (sauce.usersDisliked.includes(req.body.userId)) {
                    mongoReq = {
                        $inc: {dislikes: -1},
                        $pull: {usersDisliked: req.body.userId}
                    }
                    message = 'Dislike cancelled!'
                }
            }
            if (req.body.like === 1) {
                if (!sauce.usersLiked.includes(req.body.userId)) {
                    mongoReq = {
                        $inc: {likes: 1},
                        $push: {usersLiked: req.body.userId}
                    }
                    message = 'Like!'
                }
            }
            if (req.body.like === -1) {
                if (!sauce.usersDisliked.includes(req.body.userId)) {
                    mongoReq = {
                        $inc: {dislikes: 1},
                        $push: {usersDisliked: req.body.userId}
                    }
                    message = 'Dislike!'
                }
            }

            if(!mongoReq){
                res.status(400).json({'description': 'No likes or dislikes'})
                return
            }

            Sauce.updateOne({_id: req.params.id}, {...mongoReq})
                .then(() => res.status(201).json({message}))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(400).json({error}));
};
  /*exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) 
    .then(sauce => { 
      if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
        Sauce.updateOne(
          { _id: req.params.id},
          {
            $inc: {likes: 1}, 
            $push: {usersLiked:req.body.userId}
          }
        )
        .then(() => res.status(201).json({ message: "Like!"}))
        .catch(error => res.status(400).json({ error }));
      }
      if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: {likes: -1},
            $pull: {usersLiked:req.body.userId}
          }
        )
        .then(() => res.status(201).json({ message: "Like cancelled!"}))
        .catch(error => res.status(400).json({ error }));
      }
      if(!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: {dislikes: 1},
            $push: {usersDisliked:req.body.userId}
          }
        )
        .then(() => res.status(201).json({ message: "Dislike!"}))
        .catch(error => res.status(400).json({ error }));
      }
      if(sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: {dislikes: -1},
            $pull: {usersDisliked:req.body.userId}
          }
        )
        .then(() => res.status(201).json({ message: "Dislike cancelled!"}))
        .catch(error => res.status(400).json({ error }));
      }
    })
    .catch(error => res.status(400).json({ error }));
  };*/