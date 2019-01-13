const db = require('../db');

const _addChallengePage = (req, res, errors, runs, challenge) => {
  res.renderPage('add-challenge.ejs', 'Register Completed Challenge', {
    errors,
    runs,
    challenge
  });
};

module.exports = {
  addChallengePage: (req, res, next) => {
    let { challengeID } = req.params;
    const { player } = req.session;
    let errors = [];

    // if user not logged in, redirect them to login
    if (!player) {
      return res.redirect('/login');
    }

    db.getChallengesByID(player.id, (err, completedChallenges) => {
      if (err) {
        return next(err);
      }

      db.getChallengeByID(challengeID, (err, challenge) => {
        if (err) {
          return next(err);
        }

        for (cc in completedChallenges) {
          if (challengeID == completedChallenges[cc].challenge_id) {
            // ERROR HANDLING: redirect back to /info/challenges with the error
            // message 'You have already completed this challenge!'
            errors.push(
              'You have already completed the selected challenge: ' +
                challenge[0].name
            );
          }
        }

        db.getRuns(player.username, (err, runs) => {
          if (err) {
            return next(err);
          }

          _addChallengePage(req, res, errors, runs, challenge[0]);
        });
      });
    });
  },

  addChallenge: (req, res, next) => {
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
        return next(err);
      }

      res.redirect('/');
    });
  },

  displayChallenges: (req, res, next) => {
    const { username } = req.params;

    db.getChallengesByUsername(username, (err, challenges) => {
      if (err) {
        return next(err);
      }

      db.getRuns(username, (err, runs) => {
        if (err) {
          return next(err);
        }

        res.renderPage('display-challenges.ejs', 'Display Challenges', {
          challenges,
          runs
        });
      });
    });
  }
};
