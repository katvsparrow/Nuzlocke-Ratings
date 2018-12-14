const fs = require('fs');

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

        // let gameQuery = "SELECT * FROM `basegame`";
        // let ruleQuery = "SELECT * FROM `rule`";
        // let pokemonQuery = "SELECT * FROM `basegame_pokemon`";
        // db.query(gameQuery, (err, basegames) => {
        //     if(err) return res.status(500).send(err);

        //     db.query(ruleQuery, (err, rules) => {
        //         if(err) return res.status(500).send(err);

        //         db.query(pokemonQuery, (err, pokemon) => {
        //             if(err) return res.status(500).send(err);
        //             res.render('add-run.ejs', {
        //                 title: "Nuzlocke Ratings | Add a new run",
        //                 basegames: basegames,
        //                 rules: rules,
        //                 pokemon: pokemon,
        //                 message: ''
        //             });
        //         })
        //     });
        // });
    },


}