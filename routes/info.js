const fs = require('fs');

module.exports = {
    basegameInfo: (req, res) => {
        let query = 'SELECT * FROM `basegame`';

        db.query(query, (err, result) => {
            if(err) return res.status(500).send(err);

            res.render('basegame-info.ejs', {
                title: 'Nuzlocke Ratings | Game Info',
                basegames: result,
                message: ''
            });
        });
    },
    ruleInfo: (req, res) => {
        let query = 'SELECT * FROM `rule`';

        db.query(query, (err, result) => {
            if(err) return res.status(500).send(err);

            res.render('rule-info.ejs', {
                title: 'Nuzlocke Ratings | Rule Info',
                rules: result,
                message: ''
            });
        });
    },
    titleInfo: (req, res) => {
        let query = 'SELECT * FROM `title`';

        db.query(query, (err, result) => {
            if(err) return res.status(500).send(err);

            res.render('title-info.ejs', {
                title: 'Nuzlocke Ratings | Title Info',
                titles: result,
                message: ''
            });
        });
    },
    overallInfo: (req, res) => {
        res.render('info.ejs', {
            title: 'Nuzlocke Ratings | Info',
            message: ''       
        });
    }
}