const db = require('../db');
const viability = require('../consts/viability');
const functions_module = require('../public/assets/js/functions_module');
// const titles = require('../consts/titles');

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
    const { player } = req.session;

    db.getTitles((err, titles) => {
      if (err) return req.app.locals.error(req, res, err);

      if (player) {
        db.getChallengesByUsername(player.username, (err, challenges) => {
          if (err) return req.app.locals.error(req, res, err);
          
          challengeCounts = functions_module.countChallenges(challenges);

          req.app.locals.render(req, res, 'title-info.ejs', {
            title: 'Nuzlocke Ratings | Titles',
            challengeCounts,
            titles,
            playerRating: challenges[0].player_rating
          });        
        });
      }
      else {
        req.app.locals.render(req, res, 'title-info.ejs', {
          title: 'Nuzlocke Ratings | Titles',
          titles
        });
      }
    });
  },

  viabilityInfo: (req, res) => {
    req.app.locals.render(req, res, 'viability-info.ejs', {
      title: 'Nuzlocke Ratings | Viability Info',
      viability: viability
    });
  },

  challengeInfo: (req, res) => {
    db.getChallenges((err, result) => {
      if (err) return req.app.locals.error(req, res, err);

      multiRun = [];
      singleRun = [];
      singleBattle = [];
      leader = [];

      for(let challenge in result){
        if(result[challenge].tier != 'Leader'){
          if(result[challenge].classification == 'Multiple Runs'){
            multiRun.push(result[challenge]);
          }
          else if(result[challenge].classification == 'Single Run'){
            singleRun.push(result[challenge]);
          }
          else if(result[challenge].classification == 'Single Battle'){
            singleBattle.push(result[challenge]);
          }
        }
        else{
          leader.push(result[challenge]);
        }
      }

      req.app.locals.render(req, res, 'challenge-info.ejs', {
        title: 'Nuzlocke Ratings | Challenges',
        multiRun,
        singleRun,
        singleBattle,
        leader
      });
    });
  },

  walkthroughInfo: (req, res) => {
    req.app.locals.render(req, res, 'walkthrough.ejs', {
      title: 'Nuzlocke Ratings | Getting Started',
    });
  }
};
