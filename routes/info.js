const db = require('../db');
const viability = require('../consts/viability');
const functions_module = require('../public/assets/js/functions_module');

module.exports = {
  overallInfo: (req, res) => {
    res.renderPage('info.ejs', 'Info');
  },

  basegameInfo: (req, res, next) => {
    db.getBasegames((err, result) => {
      if (err) {
        return next(err);
      }

      res.renderPage('basegame-info.ejs', 'Game Info', {
        basegames: result
      });
    });
  },

  ruleInfo: (req, res, next) => {
    db.getRules((err, result) => {
      if (err) {
        return next(err);
      }

      res.renderPage('rule-info.ejs', 'Rule Info', {
        rules: result
      });
    });
  },

  titleInfo: (req, res, next) => {
    const { player } = req.session;

    db.getTitles((err, titles) => {
      if (err) {
        return next(err);
      }

      if (player) {
        db.getChallengesByUsername(player.username, (err, challenges) => {
          if (err) {
            return next(err);
          }

          challengeCounts = functions_module.countChallenges(challenges);

          res.renderPage('title-info.ejs', 'Titles', {
            challengeCounts,
            titles,
            playerRating: challenges[0].player_rating
          });
        });
      } else {
        res.renderPage('title-info.ejs', 'Titles', {
          titles
        });
      }
    });
  },

  viabilityInfo: (req, res) => {
    res.renderPage('viability-info.ejs', 'Viability Info', {
      viability: viability
    });
  },

  challengeInfo: (req, res, next) => {
    db.getChallenges((err, result) => {
      if (err) {
        next(err);
      }

      multiRun = [];
      singleRun = [];
      singleBattle = [];
      leader = [];

      for (let challenge in result) {
        if (result[challenge].tier != 'Leader') {
          if (result[challenge].classification == 'Multiple Runs') {
            multiRun.push(result[challenge]);
          } else if (result[challenge].classification == 'Single Run') {
            singleRun.push(result[challenge]);
          } else if (result[challenge].classification == 'Single Battle') {
            singleBattle.push(result[challenge]);
          }
        } else {
          leader.push(result[challenge]);
        }
      }

      res.renderPage('challenge-info.ejs', 'Challenges', {
        multiRun,
        singleRun,
        singleBattle,
        leader
      });
    });
  },

  walkthroughInfo: (req, res) => {
    res.renderPage('walkthrough.ejs', 'Getting Started');
  },

  creditsPage: (req, res) => {
    res.renderPage('credits.ejs', 'Credits');
  }
};
