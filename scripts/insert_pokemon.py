import json
import collections

with open('data/pokemon.json', 'r') as fp:
    pokemonData = json.load(fp)


pokemonQuery = "INSERT INTO Pokemon(pokemon_id, name) VALUES (%s, \"%s\");\n"

with open('insert_pokemon.sql', 'w') as fp:
    fp.write('DELETE FROM Pokemon;\n\n')

    count = 1
    for pokemon in pokemonData['Pokemon']:
        fp.write(pokemonQuery % (count, pokemon['Name']))
        count = count + 1

    fp.write('\nALTER TABLE Pokemon AUTO_INCREMENT = 0')


pokemonRanksQuery = "\
INSERT INTO Pokemon_Rank\n\
SELECT Pokemon.pokemon_id, Basegame.basegame_id, \"%s\"\n\
FROM Basegame, Pokemon\n\
WHERE Pokemon.name=\"%s\" AND Basegame.name=\"%s\";\n\n"

with open('insert_pokemon_ranks.sql', 'w') as fp:
    fp.write('DELETE FROM Pokemon_Rank;\n\n')

    for pokemon in pokemonData['Pokemon']:
        orderedGames = collections.OrderedDict(
            sorted(pokemon['Ranks'].items()))
        for game, rank in orderedGames.items():
            fp.write(pokemonRanksQuery % (rank, pokemon['Name'], game))
