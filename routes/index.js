const db = require('../db');

module.exports = {
  homePage: (req, res) => {
    db.getLeaderboard((err, result) => {
      if (err) return req.app.locals.error(req, res, err);

      req.app.locals.render(req, res, 'index.ejs', {
        title: 'Nuzlocke Ratings | Leaderboard',
        players: result
      });
    });
  }
};
