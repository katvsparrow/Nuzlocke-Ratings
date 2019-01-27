const mysql = require('mysql');
const fs = require('fs');
const async = require('async');
const MySQLStore = require('express-mysql-session');

const connectionString = process.env.JAWSDB_MARIA_URL;

// if env variable exists, it's on cloud; otherwise, use localhost
const connection = connectionString
  ? connectionString + '?multipleStatements=true'
  : {
      host: 'localhost',
      user: 'root',
      password: 'rootroot',
      database: 'nrs',
      multipleStatements: true
    };
// create a pool for more efficient connection management
const db = mysql.createPool(connection);

module.exports = {
  // create a session store for maintaining logins
  sessionStore: new MySQLStore({}, db),

  // retrieve leaderboard
  // result: [player_id, username, rating, runs_completed, challenges_completed, title_name, abbreviation]
  getLeaderboard: callback => {
    const query =
      'SELECT player_id, username, rating, runs_completed, challenges_completed, Title.name as title_name, abbreviation, color ' +
      'FROM Player LEFT JOIN Title ON Player.title_id = Title.title_id ORDER BY rating DESC';

    db.query(query, callback);
  },

  // retrieve base game information
  // result: [basegame_name, generation, region, difficulty]
  getBasegames: callback => {
    const query =
      'SELECT name as basegame_name, generation, region, difficulty ' +
      'FROM Basegame';

    db.query(query, callback);
  },

  // retrieve nuzlocke rule information
  // result: [name, difficulty]
  getRules: callback => {
    const query = 'SELECT name, difficulty, description FROM Rule';

    db.query(query, callback);
  },

  // retrieve title information
  // result: [title_id, name, abbreviation, rating_floor, min_bronze_challenges, min_silver_challenges, min_gold_challenges]
  getTitles: callback => {
    const query =
      'SELECT title_id, name, abbreviation, rating_floor, min_bronze_challenges, min_silver_challenges, min_gold_challenges, color FROM Title';

    db.query(query, callback);
  },

  // retrieve challenge information
  // result: [challenge_id, name, tier, classification, description]
  getChallenges: callback => {
    const query =
      'SELECT challenge_id, name, tier, classification, description FROM Challenge';

    db.query(query, callback);
  },

  // retrieve a single challenge given its ID
  // result: [name, tier, classification, description]
  getChallengeByID: (id, callback) => {
    const query =
      'SELECT name, tier, classification, description FROM Challenge WHERE challenge_id = ?';
    const values = [id];

    db.query(query, values, callback);
  },

  // retrieve a single title given its ID
  // result: [name, abbreviation, rating_floor, min_bronze_challenges, min_silver_challenges, min_gold_challenges]
  getTitleByID: (id, callback) => {
    const query = 'SELECT * FROM Title WHERE title_id = ?';
    const values = [id];

    db.query(query, values, callback);
  },

  // retrieve a specific player's information given their username
  // result: [Player *, Title *]
  getPlayerByUsername: (username, callback) => {
    const query =
      'SELECT * FROM Player LEFT JOIN Title ON Player.title_id = Title.title_id WHERE username = ?';
    const values = [username];

    db.query(query, values, callback);
  },

  // retrieve a specific player's challenges given their username
  // result: [challenge_name, tier, classification, description, run_name, player_rating]
  getChallengesByUsername: (username, callback) => {
    const query =
      'SELECT Challenge.name as challenge_name, tier, classification, description, Run.name as run_name, Player.rating as player_rating FROM Player ' +
      'LEFT JOIN Player_Challenge ON Player.player_id = Player_Challenge.player_id ' +
      'LEFT JOIN Run ON Player_Challenge.run_id = Run.run_id ' +
      'LEFT JOIN Challenge ON Player_Challenge.challenge_id = Challenge.challenge_id ' +
      'WHERE username = ?';
    const values = [username];

    db.query(query, values, callback);
  },

  // retrieve a specific player's information given their ID
  // result: [player_id, username, password, email, link, discord, rating, runs_completed]
  getPlayerById: (playerId, callback) => {
    const query = 'SELECT * FROM Player WHERE player_id = ?';

    db.query(query, playerId, callback);
  },

  // add a new player to DB
  // result.insertId = playerId
  addPlayer: (player, callback) => {
    const query = 'INSERT INTO Player SET ?';

    db.query(query, player, callback);
  },

  loginPlayer: (username, password, callback) => {
    const query = 'SELECT * FROM Player WHERE username = ? AND password = ?';
    const values = [username, password];

    db.query(query, values, callback);
  },

  // edit a player's info
  editPlayer: (playerId, newInfo, callback) => {
    const query = 'UPDATE Player SET ? WHERE player.player_id = ?';
    const values = [newInfo, playerId];

    db.query(query, values, callback);
  },

  // delete a player
  deletePlayer: (playerId, callback) => {
    //const getImageQuery = 'SELECT avatar from Player WHERE player_id = ?';
    const deleteUserQuery = 'DELETE FROM Player WHERE player_id = ?';
    db.query(deleteUserQuery, playerId, callback);

    /*db.query(getImageQuery, playerId, (err, result) => {
      if (err) return callback(err);

      const image = result[0].avatar;

      fs.unlink(public/assets/img/${image}, err => {
        if (err) {
          console.error(err);
        }
      });

      db.query(deleteUserQuery, playerId, callback);
    });*/
  },

  // get Pokemon ranking info by basegame
  // result: [pokemon_name, basegame_name, rank]
  getBasegamePokemon: callback => {
    const query =
      'SELECT Pokemon.name as pokemon_name, Basegame.name as basegame_name, rank, difficulty ' +
      'FROM Pokemon_Rank ' +
      'INNER JOIN Pokemon ON Pokemon.pokemon_id = Pokemon_Rank.pokemon_id ' +
      'INNER JOIN Basegame ON Basegame.basegame_id = Pokemon_Rank.basegame_id ' +
      'ORDER BY Pokemon.name';

    db.query(query, callback);
  },

  addTitle: (titleId, playerId, callback) => {
    const query = 'UPDATE Player SET title_id = ? WHERE player_id = ?';
    const values = [titleId, playerId];

    db.query(query, values, callback);
  },

  // add a new run, which involves adding to party and ruleset
  addRun: (runInfo, callback) => {
    const query =
      'INSERT INTO Run (name, basegame_id, player_id, link, deaths, rating) ' +
      'SELECT ?, Basegame.basegame_id, ?, ?, ?, ? ' +
      'FROM Basegame ' +
      'WHERE Basegame.name = ?';
    const values = [
      runInfo.name,
      runInfo.playerId,
      runInfo.link,
      runInfo.deaths,
      runInfo.rating,
      runInfo.basegame
    ];

    db.query(query, values, (err, result) => {
      if (err || result.affectedRows != 1) return callback(err);

      const insertId = result.insertId;
      const { party, ruleset } = runInfo;
      let query2 = '';

      for (let pokemon of party) {
        const partyQuery =
          'INSERT INTO Party (run_id, pokemon_id) ' +
          'SELECT ?, pokemon_id ' +
          'FROM Pokemon WHERE name = ?;';
        query2 += mysql.format(partyQuery, [insertId, pokemon]);
      }

      for (let rule of ruleset) {
        const ruleQuery =
          'INSERT INTO Ruleset (run_id, rule_id) ' +
          'SELECT ?, rule_id ' +
          'FROM Rule WHERE name = ?;';
        query2 += mysql.format(ruleQuery, [insertId, rule]);
      }

      db.query(query2, callback);
    });
  },

  // get a player's completed challenges
  getChallengesByID: (playerId, callback) => {
    const query =
      'SELECT * FROM Challenge INNER JOIN Player_Challenge ON Challenge.challenge_id = Player_Challenge.challenge_id WHERE player_id = ?';

    db.query(query, [playerId], callback);
  },

  // register challenge completion
  challengeCompletion: (playerId, challengeId, runName, callback) => {
    const query =
      'INSERT INTO Player_Challenge (player_id, challenge_id, run_id) SELECT ?, ?, run_id FROM run WHERE run.name = ?';

    db.query(query, [playerId, challengeId, runName], callback);
  },

  // update player's rating
  updateRating: (playerId, newRating, callback) => {
    const query = 'UPDATE Player SET rating = ? WHERE player_id = ?';

    db.query(query, [newRating, playerId], callback);
  },

  // get all of a player's runs
  getRuns: (username, callback) => {
    const runQuery =
      'SELECT *, Run.name AS run_name, Basegame.name as basegame_name FROM Run ' +
      'INNER JOIN Basegame ON Basegame.basegame_id = Run.basegame_id ' +
      'WHERE player_id = (SELECT player_id FROM Player WHERE username=?)';

    db.query(runQuery, username, (err, result) => {
      if (err) return callback(err);

      let runs = result;

      const partyQuery =
        'SELECT Pokemon.name FROM Run ' +
        'INNER JOIN Party ON Party.run_id = Run.run_id ' +
        'INNER JOIN Pokemon ON Pokemon.pokemon_id = Party.pokemon_id ' +
        'WHERE Run.run_id = ? AND Run.player_id = (SELECT player_id FROM Player WHERE username=?)';
      const rulesetQuery =
        'SELECT Rule.name FROM Run ' +
        'INNER JOIN Ruleset ON Ruleset.run_id = Run.run_id ' +
        'INNER JOIN Rule ON Rule.rule_id = Ruleset.rule_id ' +
        'WHERE Run.run_id = ? AND Run.player_id = (SELECT player_id FROM Player WHERE username=?)';

      // for each run, query their parties and results
      // callback(err, runs) will be invoked when all queries are finished
      async.each(
        runs,
        // this function is called for each run
        // runsCallback is called when all runs have finished their queries
        (run, runsCallback) => {
          const values = [run.run_id, username];
          // the following two functions query party and ruleset for each run
          // "parallel" is parallel in the sense that there is no function order
          // however, it is not true parallel as JS is single-threaded
          async.parallel(
            [
              // query party and set run.party to the result
              runCallback => {
                db.query(partyQuery, values, (partyErr, partyResult) => {
                  if (partyErr) return runCallback(partyErr);

                  run.party = partyResult;
                  runCallback();
                });
              },
              //query ruleset and set run.ruleset to the result
              runCallback => {
                db.query(rulesetQuery, values, (rulesetErr, rulesetResult) => {
                  if (rulesetErr) return runCallback(rulesetErr);

                  run.ruleset = rulesetResult;
                  runCallback();
                });
              }
            ],
            // this is called when the above two queries have finished
            err => runsCallback(err)
          );
        },
        // this is called when all runs have finished their queries
        // invoke the original callback of the caller of getRuns()
        err => {
          return callback(err, runs);
        }
      );
    });
  }
};
