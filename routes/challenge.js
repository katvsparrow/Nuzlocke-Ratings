const db = require('../db');

module.exports = {
  addChallengePage: (req, res) => {
    let challengeID = req.params.challenge_id;
    const { player } = req.session;

    // if user not logged in, redirect them to login
    if (!player) {
      return res.redirect('/login');
    }

    db.getChallengeByID(challengeID, (err, challenge) => {
      if (err) {
        return req.app.locals.error(req, res, err);
      }

      db.getRuns(player.username, (err, runs) => {
        if (err) {
          return req.app.locals.error(req, res, err);
        }

        req.app.locals.render(req, res, 'add-challenge.ejs', {
          title: 'Nuzlocke Ratings | Register Completed Challenge',
          runs,
          challenge: challenge[0]
        });
      });
    });
  },

  addChallenge: (req, res) => {
    console.log('Hello there')
  }
}