const db = require('../db');
const auth = require('../auth');

const _registerPage = (req, res, errors) => {
  res.renderPage('register.ejs', 'Register', {
    errors
  });
};

const _loginPage = (req, res, errors) => {
  res.renderPage('login.ejs', 'Login', {
    errors
  });
};

module.exports = {
  registerPage: (req, res) => {
    _registerPage(req, res);
  },

  register: (req, res, next) => {
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
          return next(err);
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

  editPlayerPage: (req, res, next) => {
    const { username } = req.params;
    const { player } = req.session;

    // verify correct user is logged in
    if (!player || player.username != username) {
      return res.renderAccessDenied();
    }

    db.getPlayerByUsername(username, (err, result) => {
      // if DB error or username not found, show error
      if (err || result.length == 0) {
        return next(err);
      }

      res.renderPage('edit-player.ejs', 'Edit Player', {
        player: result[0]
      });
    });
  },

  editPlayer: (req, res, next) => {
    const { username } = req.params;
    const { player } = req.session;

    // verify correct user is logged in
    if (!player || player.username != username) {
      return res.renderAccessDenied();
    }

    const { link, email, discord } = req.body;
    const newInfo = {
      link,
      email,
      discord
    };

    db.editPlayer(player.id, newInfo, err => {
      if (err) {
        return next(err);
      }

      res.redirect('/');
    });
  },

  playerProfile: (req, res, next) => {
    const { username } = req.params;

    db.getPlayerByUsername(username, (err, playerInfo) => {
      if (err) {
        return next(err);
      }

      db.getChallengesByUsername(username, (err, challenges) => {
        if (err) {
          return next(err);
        }

        db.getRuns(username, (err, runs) => {
          if (err) {
            return next(err);
          }

          res.renderPage('player-profile.ejs', username, {
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
