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

let _basegames = [];
let _pokemon = [];
let _rules = [];
const _addRunPage = (req, res, errors, basegames, pokemon, rules) => {
  _basegames = basegames;
  _pokemon = pokemon;
  _rules = rules;

  res.renderPage('add-run.ejs', 'Add a new run', {
    errors,
    basegames,
    pokemon,
    rules
  });
};

module.exports = {
  addRunPage: (req, res, next) => {
    const { player } = req.session;

    // if user not logged in, redirect them to login
    if (!player) {
      return res.redirect('/login');
    }

    db.getRules((err, rules) => {
      if (err) {
        return next(err);
      }

      db.getBasegamePokemon((err, pokemon) => {
        if (err) {
          return next(err);
        }

        const basegames = getUniqueBasegames(pokemon);
        _addRunPage(req, res, [], basegames, pokemon, rules);
      });
    });
  },

  addRun: (req, res, next) => {
    const { player } = req.session;
    if (!player) {
      return res.redirect('/login');
    }

    let { name, link, basegame, deaths, rating, party, ruleset } = req.body;
    deaths = parseInt(deaths);
    rating = parseInt(rating);
    const playerId = player.id;

    let errors = [];
    if (!name || typeof name != 'string') {
      errors.push('Run name cannot be empty.');
    }
    if (typeof link != 'string') {
      errors.push('Link must be valid.');
    }
    if (!basegame) {
      errors.push('Basegame cannot be empty.');
    }
    if (isNaN(deaths)) {
      errors.push('Deaths cannot be empty.');
    }
    if (isNaN(rating)) {
      errors.push('Rating cannot be empty.');
    }
    let validParty = false;
    if (party) {
      for (let i = 0; i < party.length; i++) {
        if (party[i] != 'Empty team slot') {
          validParty = true;
          break;
        }
      }
    }
    if (!validParty) {
      errors.push('Party must have at least 1 Pokemon.');
    }
    if (!ruleset) {
      ruleset = [];
    }

    if (errors.length > 0) {
      return _addRunPage(req, res, errors, _basegames, _pokemon, _rules);
    }

    basegame = basegame.replace('Pokemon ', '');
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
        return next(err);
      }

      db.getPlayerById(playerId, (err, result) => {
        if (err) {
          return next(err);
        }

        const newRating = adjustRating(result[0], rating);
        db.updateRating(playerId, newRating, err => {
          if (err) {
            return next(err);
          }

          res.redirect('/');
        });
      });
    });
  },

  displayRuns: (req, res, next) => {
    const { username } = req.params;

    db.getRuns(username, (err, runs) => {
      if (err) {
        return next(err);
      }

      res.renderPage('display-runs.ejs', 'Display Runs', {
        runs
      });
    });
  }
};
