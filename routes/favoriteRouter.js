const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then((favorite) => {
        if (favorite) {
            const newCampsites = req.body;
            const existingCampsites = favorite.campsites.map((campsite) => campsite.toString());

            newCampsites.forEach((newCampsite) => {
                if (!existingCampsites.includes(newCampsite._id.toString())) {
                    favorite.campsites.push(newCampsite._id);
                }
            });

            favorite
                .save()
                .then((updatedFavorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(updatedFavorite);
                })
                .catch((err) => next(err));
        } else {
            const newFavorite = new Favorite({
                user: req.user._id,
                campsites: req.body.map((campsite) => campsite._id),
            });

            newFavorite
                .save()
                .then((createdFavorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(createdFavorite);
                })
                .catch((err) => next(err));
        }
    })
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
        .then((deletedFavorite) => {
            if (deletedFavorite) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(deletedFavorite);
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('You do not have any favorites to delete.');
            }
        })
        .catch((err) => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites');
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    const campsiteId = req.params.campsiteId;

    Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
            if (favorite) {
                if (favorite.campsites.includes(campsiteId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('That campsite is already in the list of favorites!');
                } else {
                    favorite.campsites.push(campsiteId);
                    favorite
                        .save()
                        .then((updatedFavorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(updatedFavorite);
                        })
                        .catch((err) => next(err));
                }
            } else {
                const newFavorite = new Favorite({
                    user: req.user._id,
                    campsites: [campsiteId],
                });

                newFavorite
                    .save()
                    .then((createdFavorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(createdFavorite);
                    })
                    .catch((err) => next(err));
            }
        })
        .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const campsiteId = req.params.campsiteId;

    Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
            if (favorite) {
                const campsiteIndex = favorite.campsites.indexOf(campsiteId);
                if (campsiteIndex !== -1) {
                    favorite.campsites.splice(campsiteIndex, 1);
                    favorite
                        .save()
                        .then((updatedFavorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(updatedFavorite);
                        })
                        .catch((err) => next(err));
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('The specified campsite is not in the list of favorites.');
                }
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('You do not have any favorites to delete.');
            }
        })
        .catch((err) => next(err));
});

module.exports = favoriteRouter;