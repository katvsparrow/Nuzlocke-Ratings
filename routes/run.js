const fs = require('fs');

module.exports = {

    addRunPage: (req, res) => {
        let query = "SELECT * FROM `basegame`";
        db.query(query, (err, result) => {
            if(err){
                return res.status(500).send(err);
            }
            res.render('add-run.ejs', {
                title: "Nuzlocke Ratings | Add a new run",
                basegames: result,
                message: ''
            });
        });
    },


}