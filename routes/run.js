const db = require('../db');

function getUniqueBasegames(arr) {
  result = [];
  added = [];
  for (var i = 0; i < arr.length; i++) {
    if (!added.includes(arr[i]['basegame_name'])) {
      result.push({
        basegame_name: arr[i]['basegame_name'],
        difficulty: arr[i]['difficulty']
      });
      added.push(arr[i]['basegame_name']);
    }
  }
  return result;
}

function getExpectedScore(player, gameRating) {
  return 1.0 / (1 + 10 ** ((gameRating - player.rating) / 400.0));
}

function calculateK(player) {
  return 800.0 / (player.runs_completed + 1) /*player.tournament_round*/;
}

function adjustRating(player, gameRating) {
  return Math.floor(
    player.rating +
      calculateK(player) * (1 - getExpectedScore(player, gameRating))
  );
}

module.exports = {
  addRunPage: (req, res) => {
    const { player } = req.session;

    // if user not logged in, redirect them to login
    if (!player) {
      return res.redirect('/login');
    }

    db.getRules((err, rules) => {
      if (err) {
        return req.app.locals.error(req, res, err);
      }

      db.getBasegamePokemon((err, pokemon) => {
        if (err) {
          return req.app.locals.error(req, res, err);
        }

        const basegames = getUniqueBasegames(pokemon);

        req.app.locals.render(req, res, 'add-run.ejs', {
          title: 'Nuzlocke Ratings | Add a new run',
          basegames,
          pokemon,
          rules
        });
      });
    });
  },

  addRun: (req, res) => {
    let { name, link, basegame, deaths, rating, party, ruleset } = req.body;
    basegame = basegame.replace('Pokemon ', '');
    rating = parseInt(rating);
    const playerId = req.session.player.id;

    const runInfo = {
      name,
      link,
      basegame,
      playerId,
      deaths,
      rating,
      party,
      ruleset
    };

    db.addRun(runInfo, err => {
      if (err) {
        return req.app.locals.error(req, res, err);
      }

      db.getPlayerById(playerId, (err, result) => {
        if (err) {
          return req.app.locals.error(req, res, err);
        }

        const newRating = adjustRating(result[0], rating);
        db.updateRating(playerId, newRating, err => {
          if (err) {
            return req.app.locals.error(req, res, err);
          }

          res.redirect('/');
        });
      });
    });
  },

  displayRuns: (req, res) => {
    const { username } = req.params;

    db.getRuns(username, (err, runs) => {
      if (err) {
        return req.app.locals.error(req, res, err);
      }

      //runs = mergeRunData(runs);
      req.app.locals.render(req, res, 'display-runs.ejs', {
        title: 'Nuzlocke Ratings | Display Runs',
        runs
      });
    });
  }
};
