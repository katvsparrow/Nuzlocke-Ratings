const db = require('../db');
const hash = require('../hash');

const _registerPage = (req, res, errors) => {
  req.app.locals.render(req, res, 'register.ejs', {
    title: 'Nuzlocke Ratings | Register',
    errors
  });
};

const _loginPage = (req, res, errors) => {
  req.app.locals.render(req, res, 'login.ejs', {
    title: 'Nuzlocke Ratings | Login',
    errors
  });
};

module.exports = {
  registerPage: (req, res) => {
    _registerPage(req, res);
  },

  register: (req, res) => {
    /*if (!req.files) {
      return res.status(400).send('No files were uploaded.');
    }*/

    const { username, password, email, link, discord } = req.body;

    let errors = [];
    if (!username) {
      errors.push('Username cannot be empty.');
    }
    if (!password) {
      errors.push('Password cannot be empty.');
    }

    if (errors.length > 0) {
      return _registerPage(req, res, errors);
    }

    /*const uploadedFile = req.files.avatar;
    let fileExtension = uploadedFile.mimetype.split('/')[1];
    const avatar = username + '.' + fileExtension;*/

    const player = {
      username,
      password: hash(password),
      email,
      link,
      discord
    };

    db.getPlayerByUsername(username, (err, result) => {
      if (err) {
        return req.app.locals.error(req, res, err);
      }

      // if username exists, re-render with message
      if (result.length > 0) {
        return _registerPage(req, res, ['Username already exists.']);
      }

      // check the filetype before uploading it
      /*if (
        uploadedFile.mimetype !== 'image/png' &&
        uploadedFile.mimetype !== 'image/jpeg' &&
        uploadedFile.mimetype !== 'image/gif'
      ) {
        return _registerPage(
          req,
          res,
          "Invalid file format. Only 'gif', 'jpeg' and 'png' images are allowed."
        );
      }

      // upload the file to the /public/assets/img directory
      uploadedFile.mv(`public/assets/img/${avatar}`, err => {
        if (err) {
          console.error(err);
        }
      });*/

      // send the player's details to the database
      db.addPlayer(player, (err, result) => {
        if (err) {
          req.app.locals.error(req, res, err);
        }

        player.id = result.insertId;
        req.session.player = {
          username: player.username,
          id: player.player_id
        };
        res.redirect('/');
      });
    });
  },

  loginPage: (req, res) => {
    _loginPage(req, res);
  },

  login: (req, res) => {
    const { username, password } = req.body;

    let errors = [];
    if (!username) {
      errors.push('Username cannot be empty.');
    }
    if (!password) {
      errors.push('Password cannot be empty.');
    }

    if (errors.length > 0) {
      return _loginPage(req, res, errors);
    }

    db.loginPlayer(username, hash(password), (err, result) => {
      if (err) {
        return req.app.locals.error(req, res, err);
      }

      // if username/password don't match, re-render with message
      if (result.length == 0) {
        return _loginPage(req, res, ['Invalid username/password combination.']);
      }

      req.session.player = {
        username: result[0].username,
        id: result[0].player_id
      };
      res.redirect('/');
    });
  },

  editPlayerPage: (req, res) => {
    const { username } = req.params;
    const { player } = req.session;

    // verify correct user is logged in
    if (!player || player.username != username) {
      return req.app.locals.forbidden(req, res);
    }

    db.getPlayerByUsername(username, (err, result) => {
      // if DB error or username not found, show error
      if (err || result.length == 0) {
        return req.app.locals.error(req, res, err);
      }

      req.app.locals.render(req, res, 'edit-player.ejs', {
        title: 'Nuzlocke Ratings | Edit Player',
        player: result[0]
      });
    });
  },

  editPlayer: (req, res) => {
    const { username } = req.params;
    const { player } = req.session;

    // verify correct user is logged in
    if (!player || player.username != username) {
      return req.app.locals.forbidden(req, res);
    }

    const { link, email, discord } = req.body;
    const newInfo = {
      link,
      email,
      discord
    };

    db.editPlayer(player.id, newInfo, err => {
      if (err) {
        return req.app.locals.error(req, res, err);
      }

      res.redirect('/');
    });
  },

  playerProfile: (req, res) => {
    const { username } = req.params;
    
    db.getPlayerByUsername(username, (err, playerInfo) => {
      if (err) {
        return req.app.locals.error(req, res, err);
      }

      db.getChallengesByUsername(username, (err, challenges) => {
        if (err) {
          return req.app.locals.error(req, res, err);
        }
        req.app.locals.render(req, res, 'player-profile.ejs', {
          title: 'Nuzlocke Ratings | ' + username,
          playerInfo: playerInfo[0],
          challenges
        });
      });
    });
  }
  
  // deletePlayer: (req, res) => {
  //   const { username } = req.params;
  //   const { player } = req.session;

  //   // verify correct user is logged in
  //   if (!player || player.username != username) {
  //     return req.app.locals.forbidden(req, res);
  //   }

  //   db.deletePlayer(player.id, err => {
  //     if (err) {
  //       req.app.locals.error(req, res, err);
  //     }

  //     res.redirect('/');
  //   });
  // }
};
