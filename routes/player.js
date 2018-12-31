const db = require('../db');

module.exports = {
  addPlayerPage: (req, res) => {
    res.render('add-player.ejs', {
      title: 'Nuzlocke Ratings | Add a new player',
      message: ''
    });
  },

  addPlayer: (req, res) => {
    if (!req.files) {
      return res.status(400).send('No files were uploaded.');
    }

    const username = req.body.name;
    const uploadedFile = req.files.avatar;
    let fileExtension = uploadedFile.mimetype.split('/')[1];
    const avatar = username + '.' + fileExtension;

    const player = {
      username,
      email: req.body.email,
      link: req.body.forum_link,
      discord: req.body.discord
    };

    db.getPlayerByUsername(username, (err, result) => {
      if (err) {
        res.status(500).send('Error! Please contact server administrator.');
        throw err;
      }

      // if username exists, re-render with message
      if (result.length > 0) {
        return res.render('add-player.ejs', {
          message: 'Username already exists',
          title: 'Nuzlocke Ratings | Add a new player'
        });
      }

      // check the filetype before uploading it
      if (
        uploadedFile.mimetype !== 'image/png' &&
        uploadedFile.mimetype !== 'image/jpeg' &&
        uploadedFile.mimetype !== 'image/gif'
      ) {
        return res.render('add-player.ejs', {
          message:
            "Invalid file format. Only 'gif', 'jpeg' and 'png' images are allowed.",
          title: 'Nuzlocke Ratings | Add a new player'
        });
      }

      // upload the file to the /public/assets/img directory
      uploadedFile.mv(`public/assets/img/${avatar}`, err => {
        if (err) {
          console.error(err);
        }
      });

      // send the player's details to the database
      db.addPlayer(player, err => {
        if (err) {
          res.status(500).send('Error! Please contact server administrator.');
          throw err;
        }
        res.redirect('/');
      });
    });
  },

  editPlayerPage: (req, res) => {
    const playerId = req.params.id;

    db.getPlayerById(playerId, (err, result) => {
      if (err) {
        res.status(500).send('Error! Please contact server administrator.');
        throw err;
      }

      let message = '';
      if (result.length == 0) {
        message = 'No player found with that ID.';
      }
      res.render('edit-player.ejs', {
        title: 'Edit Player',
        player: result[0],
        message
      });
    });
  },

  editPlayer: (req, res) => {
    const playerId = req.params.id;
    const newInfo = {
      link: req.body.forum_link,
      email: req.body.email,
      discord: req.body.discord
    };

    db.editPlayer(playerId, newInfo, (err, result) => {
      if (err) {
        res.status(500).send('Error! Please contact server administrator.');
        throw err;
      }

      res.redirect('/');
    });
  },

  deletePlayer: (req, res) => {
    let playerId = req.params.id;

    db.deletePlayer(playerId, (err, result) => {
      if (err) {
        res.status(500).send('Error! Please contact server administrator.');
        throw err;
      }

      res.redirect('/');
    });
  }
};
