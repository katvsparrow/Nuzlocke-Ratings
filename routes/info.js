const db = require('../db');
const titles = require('../consts/titles');

module.exports = {
  overallInfo: (req, res) => {
    res.render('info.ejs', {
      title: 'Nuzlocke Ratings | Info',
      message: ''
    });
  },

  basegameInfo: (req, res) => {
    db.getBasegames((err, result) => {
      if (err) {
        res.status(500).send('Error! Please contact server administrator.');
        throw err;
      }

      res.render('basegame-info.ejs', {
        title: 'Nuzlocke Ratings | Game Info',
        basegames: result
      });
    });
  },

  ruleInfo: (req, res) => {
    db.getRules((err, result) => {
      if (err) {
        res.status(500).send('Error! Please contact server administrator.');
        throw err;
      }

      res.render('rule-info.ejs', {
        title: 'Nuzlocke Ratings | Rule Info',
        rules: result
      });
    });
  },

  titleInfo: (req, res) => {
    res.render('title-info.ejs', {
      title: 'Nuzlocke Ratings | Title Info',
      titles
    });
  }
};
