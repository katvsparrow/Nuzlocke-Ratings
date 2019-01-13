const db = require('../db');

module.exports = {
  homePage: (req, res, next) => {
    db.getLeaderboard((err, result) => {
      if (err) {
        return next(err);
      }

      res.renderPage('index.ejs', 'Leaderboard', {
        players: result
      });
    });
  }
};
