import json
import collections

abbrev = input('Game abbreviation: ')
abbrev = abbrev.lower()
fileName = 'data/pokemon_' + abbrev + '.json'
sqlFile = 'insert_pokemon_ranks_' + abbrev + '.sql'

with open(fileName, 'r') as fp:
  pokemonData = json.load(fp)

pokemonRanksQuery = "\
INSERT INTO Pokemon_Rank\n\
SELECT Pokemon.pokemon_id, Basegame.basegame_id, \"%s\"\n\
FROM Basegame, Pokemon\n\
WHERE Pokemon.name=\"%s\" AND Basegame.name=\"%s\";\n\n"

with open(sqlFile, 'w') as fp:
  for pokemon in pokemonData['Pokemon']:
    orderedGames = collections.OrderedDict(
        sorted(pokemon['Ranks'].items())
      )
    for game, rank in orderedGames.items():
      fp.write(pokemonRanksQuery % (rank, pokemon['Name'], game))