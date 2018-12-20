module.exports = {
  getHomePage: (req, res) => {
    let query = 'SELECT * FROM `Player` ORDER BY `rating` DESC'; // query database to get all the players

    // execute query
    db.query(query, (err, result) => {
      if (err) {
        throw err;
      }
      res.render('index.ejs', {
        title: 'Nuzlocke Ratings | Leaderboard',
        players: result
      });
    });
  }
};
