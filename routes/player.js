const db = require('../db');
const auth = require('../auth');

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

  register: (req, res, next) => {
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

    auth.register(username, password, (err, status) => {
      if (err) {
        return next(err);
      }
      if (status != 200) {
        if (status == 409) {
          return _registerPage(req, res, ['Username already exists.']);
        }

        return _registerPage(req, res, [
          'There was an error with registration, please contact server administrator.'
        ]);
      }

      const player = {
        username,
        email,
        link,
        discord
      };

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

  login: (req, res, next) => {
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

    auth.login(username, password, (err, status) => {
      if (err) {
        return next(err);
      }
      if (status != 200) {
        if (status == 404) {
          return _loginPage(req, res, ['Username does not exist.']);
        }
        if (status == 403) {
          return _loginPage(req, res, ['Incorrect password.']);
        }

        return _loginPage(req, res, [
          'There was an error logging in, please try again.'
        ]);
      }

      db.getPlayerByUsername(username, (err, results) => {
        if (err) {
          return next(err);
        }

        req.session.player = {
          username,
          id: results[0].player_id
        };
        res.redirect('/');
      });
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

        db.getRuns(username, (err, runs) => {
          if (err) {
            return req.app.locals.error(req, res, err);
          }

          req.app.locals.render(req, res, 'player-profile.ejs', {
            title: 'Nuzlocke Ratings | ' + username,
            playerInfo: playerInfo[0],
            challenges,
            runs
          });
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
