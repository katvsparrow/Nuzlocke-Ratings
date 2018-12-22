const db = require('../db');

module.exports = {
  getHomePage: (req, res) => {
    db.getLeaderboard((err, result) => {
      if (err) {
        res.status(500).send('Error! Please contact server administrator.');
        throw err;
      }

      res.render('index.ejs', {
        title: 'Nuzlocke Ratings | Leaderboard',
        players: result
      });
    });
  }
};
