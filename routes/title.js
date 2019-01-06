const db = require('../db');
const functions_module = require('../public/assets/js/functions_module');

module.exports = {
  addTitlePage: (req, res) => {
    let { titleID } = req.params;
    const { player } = req.session;
    errors = [];

    // if user isn't logged in, redirect them to login
    if (!player) {
      return res.redirect('/login');
    }

    db.getChallengesByUsername(player.username, (err, challenges) => {
      if (err) {
        return req.app.locals.error(req, res, err);
      }

      playerRating = challenges[0].player_rating;
      challengeCounts = functions_module.countChallenges(challenges);

      db.getTitleByID(titleID, (err, titleResult) => {
        if (err) {
          return req.app.locals.error(req, res, err);
        }

        titleResult = titleResult[0];

        if (!functions_module.qualifiedForTitle(titleResult, challengeCounts, playerRating)) {
          errors.push('You do not meet the requirements for this title!');
        }

        req.app.locals.render(req, res, 'add-title.ejs', {
          title: 'Nuzlocke Ratings | Apply for Title',
          titleResult,
          challengeCounts,
          errors
        });
      });
    });

  },

  addTitle: (req, res) => {
    const { player } = req.session;

    // if user isn't logged in, redirect them to login
    if (!player) {
      return res.redirect('/login');
    }

    let { titleID } = req.params;
    const playerID = player.id;

    db.addTitle(titleID, playerID, err => {
      if (err) {
        return req.app.locals.error(req, res, err);
      }

      res.redirect('/');
    });
  }
}