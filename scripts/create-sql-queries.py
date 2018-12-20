import json

# class Pokemon(object):
#     def __init__(self, name, ranks):
#         self.name = name
#         self.ranks = ranks

#     def printPokemon(self):
#         print(self.name + ":")
#         for game, rank in self.ranks.items():
#             print(game, rank, sep=': ')
#         print('----------------------------------')

pokemonList = []
baseQuery = "INSERT INTO `BaseGame_Pokemon`(`bid`, `pkmn`, `rank`) \n\
SELECT `BaseGame`.`basegame_id`, `Pokemon`.`pokemon_id`, \'%s\' \n\
FROM `BaseGame` JOIN `Pokemon` WHERE \n\
`BaseGame`.`basegame_name` = \'%s\' AND `Pokemon`.`pokemon_name` = \"%s\";\n"

with open('../data/pokemon-ranks.json', 'r') as fp:
    pokemonData = json.load(fp)
with open('pokemon_ranks.sql', 'w') as fp:
    for pokemon, ranks in pokemonData.items():
        for game, rank in ranks.items():
            fp.write(baseQuery % (rank, game, pokemon))
            fp.write('\n')
