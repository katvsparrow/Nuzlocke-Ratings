const db = require('../db');
const titles = require('../consts/titles');

module.exports = {
  overallInfo: (req, res) => {
    req.app.locals.render(req, res, 'info.ejs', {
      title: 'Nuzlocke Ratings | Info'
    });
  },

  basegameInfo: (req, res) => {
    db.getBasegames((err, result) => {
      if (err) return req.app.locals.error(req, res, err);

      req.app.locals.render(req, res, 'basegame-info.ejs', {
        title: 'Nuzlocke Ratings | Game Info',
        basegames: result
      });
    });
  },

  ruleInfo: (req, res) => {
    db.getRules((err, result) => {
      if (err) return req.app.locals.error(req, res, err);

      req.app.locals.render(req, res, 'rule-info.ejs', {
        title: 'Nuzlocke Ratings | Rule Info',
        rules: result
      });
    });
  },

  titleInfo: (req, res) => {
    req.app.locals.render(req, res, 'title-info.ejs', {
      title: 'Nuzlocke Ratings | Title Info',
      titles
    });
  }
};
