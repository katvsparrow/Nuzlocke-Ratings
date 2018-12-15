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
        basegame = basegame.replace('Pokemon ', '');

        var party = [];
        let party1 = req.body.party1;
        let party2 = req.body.party2;
        let party3 = req.body.party3;
        let party4 = req.body.party4;
        let party5 = req.body.party5;
        let party6 = req.body.party6;
        party.push(party1, party2, party3, party4, party5, party6);

        var ruleset = [];
        for(var i = 0; i < numRules; i++){
            var index = 'rule[' + i + ']';
            if(req.body[index]){
                var addRule = req.body[index];
                ruleset.push(addRule);
            }
        }
        
        let runQuery = "INSERT INTO `run` (`run_name`, `bid`, `pid`, `link`) " +
        "SELECT '" + runName + "', `basegame`.`basegame_id`, `player`.`player_id`, '" + runLink + "' " +
        "FROM `basegame` INNER JOIN `player` " +
        "WHERE `basegame`.`basegame_name` = '" + basegame + "' AND `player`.`player_id` = 1; " +
        "SET @last_run_id = LAST_INSERT_ID(); ";

        for(var i = 0; i < party.length; i++){
            var addendum = "INSERT INTO `party` (`runid`, `pkmn_id`) " +
            "SELECT @last_run_id, `pokemon_id` " +
            "FROM `pokemon` WHERE `pokemon_name` = '" + party[i] + "'; ";
            runQuery += addendum;
        }
        
        db.query(runQuery, (err, result) => {
            if(err) return res.status(500).send(err);
            res.redirect('/');
        });
    }

}