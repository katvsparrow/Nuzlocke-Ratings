const db = require('../db');

const _addChallengePage = (req, res, errors, runs, challenge) => {
  req.app.locals.render(req, res, 'add-challenge.ejs', {
    title: 'Nuzlocke Ratings | Register Completed Challenge',
    errors,
    runs,
    challenge
  });
}

module.exports = {
  addChallengePage: (req, res) => {
    let { challengeID } = req.params;
    const { player } = req.session;
    let errors = [];

    // if user not logged in, redirect them to login
    if (!player) {
      return res.redirect('/login');
    }

    db.getChallengesByID(player.id, (err, completedChallenges) => {
      if (err) {
        return req.app.locals.error(req, res, err);
      }
      
      db.getChallengeByID(challengeID, (err, challenge) => {
        if (err) {
          return req.app.locals.error(req, res, err);
        }
  
        for(cc in completedChallenges){
          if(challengeID == completedChallenges[cc].challenge_id){
            // ERROR HANDLING: redirect back to /info/challenges with the error message 'You have already completed this challenge!'
            errors.push('You have already completed the selected challenge: ' + challenge[0].name);
          }
        }

        db.getRuns(player.username, (err, runs) => {
          if (err) {
            return req.app.locals.error(req, res, err);
          }
  
          _addChallengePage(req, res, errors, runs, challenge[0]);
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
  },

  displayChallenges: (req, res) => {
    const { username } = req.params;

    db.getChallengesByUsername(username, (err, challenges) => {
      if (err) {
        return req.app.locals.error(req, res, err);
      }

      db.getRuns(username, (err, runs) => {
        if (err) {
          return req.app.locals.error(req, res, err);
        }
        console.log(challenges);
        req.app.locals.render(req, res, 'display-challenges.ejs', {
          title: 'Nuzlocke Ratings | Display Challenges',
          challenges,
          runs
        });
      });
    });
  }
}