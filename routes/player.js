const fs = require('fs');

module.exports = {
    addPlayerPage: (req, res) => {
        res.render('add-player.ejs', {
            title: "Nuzlocke Ratings | Add a new player"
            ,message: ''
        });
    },

    addPlayer: (req, res) => {
        if (!req.files) {
            return res.status(400).send("No files were uploaded.");
        }

        let message = '';
        let name = req.body.name;
        let forum_link = req.body.forum_link;
        let email = req.body.email;
        let discord = req.body.discord;
        let uploadedFile = req.files.avatar;
        let image_name = uploadedFile.name;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        image_name = name + '.' + fileExtension;

        let usernameQuery = "SELECT * FROM `player` WHERE `name` = '" + name + "'";

        db.query(usernameQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
                message = 'Username already exists';
                res.render('add-player.ejs', {
                    message,
                    title: "Nuzlocke Ratings | Add a new player"
                });
            } else {
                // check the filetype before uploading it
                if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
                    // upload the file to the /public/assets/img directory
                    uploadedFile.mv(`public/assets/img/${image_name}`, (err ) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        // send the player's details to the database
                        let query = "INSERT INTO `player` (`name`, `email`, `avatar`) VALUES ('" + name + "', '" + email + "', '" + image_name + "')";
                        db.query(query, (err, result) => {
                            if (err) {
                                return res.status(500).send(err);
                            }
                        });
                        if(forum_link){
                            db.query("UPDATE `player` SET `forum_link`='" + forum_link + "' WHERE `name`='" + name + "'", (err, result) => {
                                if (err) {
                                    return res.status(500).send(err);
                                }
                            });
                        }
                        if(discord){
                            db.query("UPDATE `player` SET `discord`='" + discord + "' WHERE `name`='" + name + "'", (err, result) => {
                                if (err) {
                                    return res.status(500).send(err);
                                }
                            });
                        }
                        res.redirect('/');
                    });
                } else {
                    message = "Invalid file format. Only 'gif', 'jpeg' and 'png' images are allowed.";
                    res.render('add-player.ejs', {
                        message,
                        title: "Welcome to Socka | Add a new player"
                    });
                }
            }
        });
    },
    editPlayerPage: (req, res) => {
        let playerId = req.params.id;
        let query = "SELECT * FROM `player` WHERE `player_id` = '" + playerId + "' ";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.render('edit-player.ejs', {
                title: "Edit Player"
                ,player: result[0]
                ,message: ''
            });
        });
    },
    editPlayer: (req, res) => {
        let playerId = req.params.id;
        let name = req.body.name;
        let forum_link = req.body.forum_link;
        let email = req.body.email;
        let discord = req.body.discord;

        let query = "UPDATE `player` SET `email` = '" + email + "', `forum_link` = '" + forum_link + "', `discord` = '" + discord + "' WHERE `player`.`player_id` = '" + playerId + "'";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.redirect('/');
        });
    },
    deletePlayer: (req, res) => {
        let playerId = req.params.id;
        let getImageQuery = 'SELECT `avatar` from `player` WHERE `player_id` = "' + playerId + '"';
        let deleteUserQuery = 'DELETE FROM player WHERE `player_id` = "' + playerId + '"';

        db.query(getImageQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            let image = result[0].avatar;

            fs.unlink(`public/assets/img/${image}`, (err) => {
                if (err) {
                    return res.status(500).send(err);
                }
                db.query(deleteUserQuery, (err, result) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    res.redirect('/');
                });
            });
        });
    }
};
