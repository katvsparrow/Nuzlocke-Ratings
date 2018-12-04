import json

def getExpectedScoreA(A, B):
    return 1.0 / (1 + 10 ** ((B - A) / 400.0))

def adjustRating(rating, expectedScore, score, k = 32):
    return rating + k * (score - expectedScore)

class Player(object):
    def __init__(self, name, rating):
        self.rating = rating
        self.name = name
    
    def match(self, game, result):
        expectedScoreA = getExpectedScoreA(self.rating, game.rating)
        if result == 'Win':
            self.rating = adjustRating(self.rating, expectedScoreA, 1)
        elif result == 'Loss':
            self.rating = adjustRating(self.rating, expectedScoreA, 0)
        elif result == 'Draw':
            self.rating = adjustRating(self.rating, expectedScoreA, 0.5)



class Game(object):
    # The ruleset and team variables are set outside __init__ because they're optional user inputs.
    # This format should make it a bit easier, as we won't have to create Game objects
    # with rulesets and teams and can instead add them after creation.
    def __init__(self, name, generation, region, difficulty):
        self.name = name
        self.generation = generation
        self.region = region
        self.difficulty = difficulty
        self.rating = self.getBaseRating()

    def getBaseRating(self):
        # Four tiers of difficulty
        # 1: 1200, 2: 1400, 3: 1600, 4: 1800
        return 1000 + 2 * self.difficulty

    def setRuleset(self, ruleset):
        self.ruleset = ruleset
        self.addRulesetModifiers()

    def addRulesetModifiers(self):
        for rule in self.ruleset:
            self.rating += 50 * rule.difficulty


    def setTeam(self, team):
        self.team = team
        self.addTeamModifiers()

    def addTeamModifiers(self):
        for pokemon in self.team:
            self.rating += pokemon.ranks[self.name]


    def addRule(self, rule):
        self.ruleset.append(rule)

    def addPokemon(self, pokemon):
        self.team.append(pokemon)


    def printGame(self):
        print(self.name, self.generation, self.region, self.difficulty, self.ruleset, sep=' | ')


class Rule(object):
    def __init__(self, name, difficulty):
        self.name = name
        self.difficulty = difficulty
        self.ratingBonus = self.getRatingBonus()

    def getRatingBonus(self):
        return self.difficulty * 50

    def printRule(self):
        print(self.name, self.difficulty, sep=' | ')



class Pokemon(object):
    def __init__(self, name, ranks):
        self.mapRanks = {
            "S" : -2,
            "A+": 0,
            "A" : 2,
            "A-": 4,
            "B+": 6,
            "B" : 8,
            "B-": 10,
            "C+": 12,
            "C" : 14,
            "C-": 16,
            "D" : 18,
            "E" : 20
        }
        self.name = name
        self.ranks = ranks
        self.convertRanks()

    def convertRanks(self):
        for game, rank in self.ranks.items():
            self.ranks[game] = self.mapRanks.get(rank)

    def printPokemon(self):
        print(self.name + ":")
        for game, rank in self.ranks.items():
            print(game, rank, sep=': ')
        print('----------------------------------')




def getGames():
    gamesList = []
    with open('data/games.json', 'r') as fp:
        gamesData = json.load(fp)
    gamesData = gamesData['Games']
    for game in gamesData:
        gamesList.append(Game(game['Name'], game['Generation'], game['Region'], game['Difficulty']))
    return gamesList

def getRules():
    rulesList = []
    with open('data/rules.json', 'r') as fp:
        rulesData = json.load(fp)
    rulesData = rulesData['Rules']
    for rule in rulesData:
        rulesList.append(Rule(rule['Name'], rule['Difficulty']))
    return rulesList

def getPokemon():
    pokemonList = []
    with open('data/pokemon-ranks.json', 'r') as fp:
        pokemonData = json.load(fp)
    for pokemon, ranks in pokemonData.items():
        pokemonList.append(Pokemon(pokemon, ranks))
    return pokemonList

gamesList = getGames()
rulesList = getRules()
pokemonList = getPokemon()

for pokemon in pokemonList:
    pokemon.printPokemon()