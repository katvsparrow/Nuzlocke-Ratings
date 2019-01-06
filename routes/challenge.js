const db = require('../db');

module.exports = {
  addChallengePage: (req, res) => {
    let { challengeID } = req.params;
    const { player } = req.session;

    // if user not logged in, redirect them to login
    if (!player) {
      return res.redirect('/login');
    }

    db.getCompletedChallenges(player.id, (err, completedChallenges) => {
      if (err) {
        return req.app.locals.error(req, res, err);
      }
      for(cc in completedChallenges){
        if(challengeID == completedChallenges[cc].challenge_id){
          // ERROR HANDLING: redirect back to /info/challenges with the error message 'You have already completed this challenge!'
        }
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
    });
  },

  addChallenge: (req, res) => {
    const { player } = req.session;
    if (!player) {
      return res.redirect('/login');
    }

    let { runName } = req.body;
    let { challengeID } = req.params;
    const playerID = player.id;

    if (!runName) {
      // ERROR HANDLING: reload the page and show message 'Please choose a valid run.'
    }

    db.challengeCompletion(playerID, challengeID, runName, err => {
      if (err) {
        return req.app.locals.error(req, res, err);
      }

      res.redirect('/');
    });
  }
}