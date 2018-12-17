const fs = require('fs');
const numRules = 11;

function getUniqueBasegames(arr){
    result = [];
    added = [];
    for(var i = 0; i < arr.length; i++){
        if(!added.includes(arr[i]['basegame_name'])){
            result.push({
                "basegame_name": arr[i]['basegame_name'],
                "difficulty": arr[i]['difficulty']
            });
            added.push(arr[i]['basegame_name']);
        }
    }
    return result;
}

function mergeRunData(runs){
    uniqueIDs = [];
    uniqueRuns = [];
    
    for(var i = 0; i < runs.length; i++){
        if(!uniqueIDs.includes(runs[i].run_id)){
            runs[i].party = [];
            runs[i].ruleset = [];
            uniqueIDs.push(runs[i].run_id);
            uniqueRuns.push(runs[i]);
        }
    }

    for(i = 0; i < uniqueRuns.length; i++){
        for(var j = 0; j < runs.length; j++){
            if(uniqueRuns[i].run_id == runs[j].run_id){
                if(uniqueRuns[i].party.length < 6)
                    uniqueRuns[i].party.push(runs[j].pokemon_name);
                if(runs[j].rule_name && !uniqueRuns[i].ruleset.includes(runs[j].rule_name))
                    uniqueRuns[i].ruleset.push(runs[j].rule_name);
            }
        }
    }

    return uniqueRuns;
}

function getExpectedScore(player, gameRating){
    return 1.0 / (1 + 10 ** ((gameRating - player.rating) / 400.0));
}

function calculateK(player){
    return 800.0 / (player.matches_played + player.tournament_round);
}

function adjustRating(player, gameRating){
    console.log(player, player.rating);
    return Math.floor(player.rating + calculateK(player) * (1 - getExpectedScore(player, gameRating)));
}

module.exports = {

    addRunPage: (req, res) => {
        let rulesQuery = "SELECT * FROM `rule`";
        let dataQuery = "SELECT * FROM `pokemon` INNER JOIN `basegame_pokemon` ON `pokemon`.`pokemon_id` = `basegame_pokemon`.`pkmn` INNER JOIN `basegame` ON `basegame`.`basegame_id` = `basegame_pokemon`.`bid`";

        db.query(rulesQuery, function getRules(err, rules){
            if(err) return res.status(500).send(err);
            db.query(dataQuery, function renderPage(err, pokemon){
                if(err) return res.status(500).send(err);
                var basegames = getUniqueBasegames(pokemon);
                
                res.render('add-run.ejs', {
                    title: "Nuzlocke Ratings | Add a new run",
                    message: '',
                    basegames: basegames,
                    pokemon: pokemon,
                    rules: rules
                });
            });
        });
    },

    addRun: (req, res) => {
        let message = '';
        let runName = req.body.run_name;
        let runLink = req.body.run_link;
        let basegame = req.body.basegame;
        let playerID = req.body.player_id;
        let deaths = req.body.deaths;
        let gameRating = parseInt(req.body.game_rating);
        basegame = basegame.replace('Pokemon ', '');

        var party = [];
        party.push(req.body.party1, req.body.party2, req.body.party3, req.body.party4, req.body.party5, req.body.party6);

        var ruleset = [];
        for(var i = 0; i < numRules; i++){
            var index = 'rule[' + i + ']';
            if(req.body[index]){
                var addRule = req.body[index];
                ruleset.push(addRule);
            }
        }
        
        let runQuery = "INSERT INTO `run` (`run_name`, `bid`, `pid`, `link`, `deaths`, `run_rating`) " +
        "SELECT '" + runName + "', `basegame`.`basegame_id`, `player`.`player_id`, '" + runLink + "', " + deaths + ", " + gameRating +
        " FROM `basegame` INNER JOIN `player` " +
        "WHERE `basegame`.`basegame_name` = '" + basegame + "' AND `player`.`player_id` = " + playerID + "; " +
        "SET @last_run_id = LAST_INSERT_ID(); ";

        for(var i = 0; i < party.length; i++){
            var addendum = "INSERT INTO `party` (`runid`, `pkmn_id`) " +
            "SELECT @last_run_id, `pokemon_id` " +
            "FROM `pokemon` WHERE `pokemon_name` = '" + party[i] + "'; ";
            runQuery += addendum;
        }
        for(var i = 0; i < ruleset.length; i++){
            var addendum = "INSERT INTO `ruleset` (`runid`, `ruleid`) " +
            "SELECT @last_run_id, `rule_id` " +
            "FROM `rule` WHERE `rule_name` = '" + ruleset[i] + "'; ";
            runQuery += addendum;
        }
        runQuery += "SET @count = (SELECT COUNT(*) FROM `run` WHERE `pid` = " + playerID + "); ";
        runQuery += "UPDATE `player` SET `matches_played` = @count WHERE `player_id` = " + playerID + "; ";
        
        db.query(runQuery, (err, result) => {
            if(err) return res.status(500).send(err);
            var updateRatingQuery = "SELECT `rating`, `matches_played`, `tournament_round` FROM `player` WHERE `player_id` = " + playerID;
            db.query(updateRatingQuery, (err, result) => {
                if(err) return res.status(500).send(err);
                newRating = adjustRating(result[0], gameRating);
                db.query("UPDATE `player` SET `rating` = " + newRating + " WHERE `player_id` = " + playerID, (err, result) => {
                    if(err) return res.status(500).send(err);
                    res.redirect('/');
                });
            });
        });
    },

    displayRuns: (req, res) => {
        let playerID = req.params.id;
        let getRunsQuery = "SELECT `run`.`run_id`, `run`.`run_rating`, `player`.`name`, `run`.`run_name`, `basegame`.`basegame_name`, `run`.`link`, `pokemon`.`pokemon_name`, `rule`.`rule_name` FROM `run` INNER JOIN `player` ON `run`.`pid` = `player`.`player_id` INNER JOIN `basegame` ON `run`.`bid` = `basegame`.`basegame_id` INNER JOIN `party` ON `run`.`run_id` = `party`.`runid` INNER JOIN `pokemon` ON `party`.`pkmn_id` = `pokemon`.`pokemon_id` LEFT JOIN `ruleset` ON `run`.`run_id` = `ruleset`.`runid` LEFT JOIN `rule` ON `ruleset`.`ruleid` = `rule`.`rule_id` WHERE `run`.`pid` = " + playerID;

        db.query(getRunsQuery, (err, result) => {
            if(err) return res.status(500).send(err);

            runs = mergeRunData(result);
            res.render('display-runs.ejs', {
                'title': 'Nuzlocke Ratings | Display Runs',
                'message': '',
                'runs': runs
            });
        });
    }

}