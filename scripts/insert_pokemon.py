import json

with open('data/pokemon.json', 'r') as fp:
    pokemonData = json.load(fp)


pokemonQuery = "INSERT INTO Pokemon(name) VALUES (\"%s\");\n"

with open('insert_pokemon.sql', 'w') as fp:
    for pokemon in pokemonData:
        fp.write(pokemonQuery % pokemon)


pokemonRanksQuery = "\
INSERT INTO Pokemon_Rank\n\
SELECT Pokemon.pokemon_id, Basegame.basegame_id, \"%s\"\n\
FROM Basegame, Pokemon\n\
WHERE Pokemon.name=\"%s\" AND Basegame.name=\"%s\";\n\n"

with open('insert_pokemon_ranks.sql', 'w') as fp:
    for pokemon in pokemonData:
        for game, rank in pokemonData[pokemon].items():
            fp.write(pokemonRanksQuery % (rank, pokemon, game))
