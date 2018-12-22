const db = require('../db');

const NUM_RULES = 11;

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

function mergeRunData(runs) {
  uniqueIDs = [];
  uniqueRuns = [];

  for (var i = 0; i < runs.length; i++) {
    if (!uniqueIDs.includes(runs[i].run_id)) {
      runs[i].party = [];
      runs[i].ruleset = [];
      uniqueIDs.push(runs[i].run_id);
      uniqueRuns.push(runs[i]);
    }
  }

  for (i = 0; i < uniqueRuns.length; i++) {
    for (var j = 0; j < runs.length; j++) {
      if (uniqueRuns[i].run_id == runs[j].run_id) {
        if (uniqueRuns[i].party.length < 6)
          uniqueRuns[i].party.push(runs[j].pokemon_name);
        if (
          runs[j].rule_name &&
          !uniqueRuns[i].ruleset.includes(runs[j].rule_name)
        )
          uniqueRuns[i].ruleset.push(runs[j].rule_name);
      }
    }
  }

  return uniqueRuns;
}

function getExpectedScore(player, gameRating) {
  return 1.0 / (1 + 10 ** ((gameRating - player.rating) / 400.0));
}

function calculateK(player) {
  return 800.0 / (player.matches_played + player.tournament_round);
}

function adjustRating(player, gameRating) {
  return Math.floor(
    player.rating +
      calculateK(player) * (1 - getExpectedScore(player, gameRating))
  );
}

module.exports = {
  addRunPage: (req, res) => {
    db.getRules((err, rules) => {
      if (err) {
        res.status(500).send('Error! Please contact server administrator.');
        throw err;
      }

      db.getBasegamePokemon((err, pokemon) => {
        if (err) {
          res.status(500).send('Error! Please contact server administrator.');
          throw err;
        }

        const basegames = getUniqueBasegames(pokemon);

        res.render('add-run.ejs', {
          title: 'Nuzlocke Ratings | Add a new run',
          message: '',
          basegames: basegames,
          pokemon: pokemon,
          rules: rules
        });
      });
    });
  },

  addRun: (req, res) => {
    const name = req.body.run_name;
    const link = req.body.run_link;
    const basegame = req.body.basegame.replace('Pokemon ', '');
    const playerId = req.body.player_id;
    const deaths = req.body.deaths;
    const rating = parseInt(req.body.game_rating);

    const party = [];
    party.push(
      req.body.party1,
      req.body.party2,
      req.body.party3,
      req.body.party4,
      req.body.party5,
      req.body.party6
    );

    const ruleset = [];
    for (let i = 0; i < NUM_RULES; i++) {
      const index = 'rule[' + i + ']';
      if (req.body[index]) {
        const addRule = req.body[index];
        ruleset.push(addRule);
      }
    }

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
        res.status(500).send('Error! Please contact server administrator.');
        throw err;
      }

      db.getPlayerStats(playerId, (err, result) => {
        if (err) {
          res.status(500).send('Error! Please contact server administrator.');
          throw err;
        }

        const newRating = adjustRating(result[0], rating);
        db.updateRating(playerId, newRating, err => {
          if (err) {
            res.status(500).send('Error! Please contact server administrator.');
            throw err;
          }

          res.redirect('/');
        });
      });
    });
  },

  displayRuns: (req, res) => {
    let playerId = req.params.id;

    db.getRuns(playerId, (err, result) => {
      if (err) {
        res.status(500).send('Error! Please contact server administrator.');
        throw err;
      }

      runs = mergeRunData(result);
      res.render('display-runs.ejs', {
        title: 'Nuzlocke Ratings | Display Runs',
        message: '',
        runs: runs
      });
    });
  }
};
