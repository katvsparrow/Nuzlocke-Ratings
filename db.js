const mysql = require('mysql');
const fs = require('fs');

const { JAWSDB_MARIA_URL } = process.env;
// if env variable exists, it's on cloud; otherwise, use localhost
const connection = JAWSDB_MARIA_URL
  ? JAWSDB_MARIA_URL + '?multipleStatements=true'
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
  // retrieve leaderboard
  getLeaderboard: callback => {
    const query = 'SELECT * FROM `Player` ORDER BY `rating` DESC';

    db.query(query, callback);
  },

  // retrieve base game information
  getBaseGames: callback => {
    const query = 'SELECT * FROM `BaseGame`';

    db.query(query, callback);
  },

  // retrieve nuzlocke rule information
  getRules: callback => {
    const query = 'SELECT * FROM `Rule`';

    db.query(query, callback);
  },

  // retrieve nuzlocke title information
  getTitles: callback => {
    const query = 'SELECT * FROM `Title`';

    db.query(query, callback);
  },

  // retrieve a specific player's information given their username
  getPlayerByUsername: (username, callback) => {
    const query = 'SELECT * FROM `Player` WHERE `name` = ?';
    const values = [username];

    db.query(query, values, callback);
  },

  // retrieve a specific player's information given their ID
  getPlayerById: (playerId, callback) => {
    const query = 'SELECT * FROM `Player` WHERE `player_id` = ?';

    db.query(query, playerId, callback);
  },

  // add a new player to DB
  addPlayer: (player, callback) => {
    const query = 'INSERT INTO `Player` SET ?';

    db.query(query, player, callback);
  },

  // edit a player's info
  editPlayer: (playerId, newInfo, callback) => {
    const query = 'UPDATE `Player` SET ? WHERE `player`.`player_id` = ?';
    const values = [newInfo, playerId];

    db.query(query, values, callback);
  },

  // delete a player
  deletePlayer: (playerId, callback) => {
    const getImageQuery = 'SELECT `avatar` from `Player` WHERE `player_id` = ?';
    const deleteUserQuery = 'DELETE FROM Player WHERE `player_id` = ?';

    db.query(getImageQuery, playerId, (err, result) => {
      if (err) return callback(err);

      const image = result[0].avatar;

      fs.unlink(`public/assets/img/${image}`, err => {
        if (err) {
          console.error(err);
        }
      });

      db.query(deleteUserQuery, playerId, callback);
    });
  },

  // get Pokemon ranking info by basegame
  getBasegamePokemon: callback => {
    const query =
      'SELECT * FROM `Pokemon`' +
      'INNER JOIN `BaseGame_Pokemon`' +
      'ON `Pokemon`.`pokemon_id` = `BaseGame_Pokemon`.`pkmn`' +
      'INNER JOIN `BaseGame`' +
      'ON `BaseGame`.`basegame_id` = `BaseGame_Pokemon`.`bid`';

    db.query(query, callback);
  },

  // add a new run, which involves adding to party and ruleset
  addRun: (runInfo, callback) => {
    const query =
      'INSERT INTO `Run` (`run_name`, `bid`, `pid`, `link`, `deaths`, `run_rating`) ' +
      'SELECT ?, `BaseGame`.`basegame_id`, `Player`.`player_id`, ?, ?, ? ' +
      'FROM `BaseGame` INNER JOIN `Player` ' +
      'WHERE `BaseGame`.`basegame_name` = ? AND `Player`.`player_id` = ?';
    const values = [
      runInfo.name,
      runInfo.link,
      runInfo.deaths,
      runInfo.rating,
      runInfo.basegame,
      runInfo.playerId
    ];

    db.query(query, values, (err, result) => {
      if (err) return callback(err);

      const insertId = result.insertId;
      const { party, ruleset, playerId } = runInfo;
      let query2 = '';

      for (let pokemon of party) {
        const partyQuery =
          'INSERT INTO `Party` (`runid`, `pkmn_id`) ' +
          'SELECT ?, `pokemon_id` ' +
          'FROM `Pokemon` WHERE `pokemon_name` = ?;';
        query2 += mysql.format(partyQuery, [insertId, pokemon]);
      }

      for (let rule of ruleset) {
        const ruleQuery =
          'INSERT INTO `Ruleset` (`runid`, `ruleid`) ' +
          'SELECT ?, `rule_id` ' +
          'FROM `Rule` WHERE `rule_name` = ?;';
        query2 += mysql.format(ruleQuery, [insertId, rule]);
      }

      const countQuery =
        'SET @count = (SELECT COUNT(*) FROM `Run` WHERE `pid` = ?);';
      query2 += mysql.format(countQuery, playerId);

      const updateQuery =
        'UPDATE `Player` SET `matches_played` = @count WHERE `player_id` = ?';
      query2 += mysql.format(updateQuery, playerId);

      db.query(query2, callback);
    });
  },

  // get player rating, matches played, and tournament round (used for calcs)
  getPlayerStats: (playerId, callback) => {
    const query =
      'SELECT `rating`, `matches_played`, `tournament_round` ' +
      'FROM `Player` WHERE `player_id` = ?';

    db.query(query, playerId, callback);
  },

  // update player's rating
  updateRating: (playerId, newRating, callback) => {
    const query = 'UPDATE `Player` SET `rating` = ? WHERE `player_id` = ?';

    db.query(query, [newRating, playerId], callback);
  },

  // get all of a player's runs
  getRuns: (playerId, callback) => {
    const query =
      'SELECT `Run`.`run_id`, `Run`.`run_rating`, `Player`.`name`, `Run`.`run_name`, `BaseGame`.`basegame_name`, `Run`.`link`, `Pokemon`.`pokemon_name`, `Rule`.`rule_name`' +
      'FROM `Run`' +
      'INNER JOIN `Player` ON `Run`.`pid` = `Player`.`player_id`' +
      'INNER JOIN `BaseGame` ON `Run`.`bid` = `BaseGame`.`basegame_id`' +
      'INNER JOIN `Party` ON `Run`.`run_id` = `Party`.`runid`' +
      'INNER JOIN `Pokemon` ON `Party`.`pkmn_id` = `Pokemon`.`pokemon_id`' +
      'LEFT JOIN `Ruleset` ON `Run`.`run_id` = `Ruleset`.`runid`' +
      'LEFT JOIN `Rule` ON `Ruleset`.`ruleid` = `Rule`.`rule_id`' +
      'WHERE `Run`.`pid` = ?';

    db.query(query, playerId, callback);
  }
};
