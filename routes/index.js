module.exports = {
    getHomePage: (req, res) => {
        let query = "SELECT * FROM `player` ORDER BY `rating` DESC"; // query database to get all the players

        // execute query
        db.query(query, (err, result) => {
            if (err) {
                res.redirect('/');
            }
            res.render('index.ejs', {
                title: "Nuzlocke Ratings | Leaderboard",
                players: result
            });
        });
    },
};