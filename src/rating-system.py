import json
from math import floor

class Player(object):
    def __init__(self, name, rating = 1000, matchesPlayed = 0, tournamentRound = 1):
        self.rating = rating
        self.name = name
        self.matchesPlayed = matchesPlayed
        self.tournamentRound = tournamentRound

    def getExpectedScore(self, gameRating):
        return 1.0 / (1 + 10 ** ((gameRating - self.rating) / 400.0))

    def adjustRating(self, score):
        return floor(self.rating + self.k * (score - self.expectedScore))

    def calculateK(self):
        return 800 / (self.matchesPlayed + self.tournamentRound)

    def startTournament(self):
        self.tournamentRound = 1
    
    def match(self, game, numDeaths):
        self.expectedScore = self.getExpectedScore(game.rating)
        self.k = self.calculateK()
        print(self.rating, game.rating)
        if 0 <= numDeaths < 6:
            self.rating = self.adjustRating(1)
        elif 6 <= numDeaths < 12:
            self.rating = self.adjustRating(0.5)
        else:
            self.rating = self.adjustRating(0)
        
        if self.rating < 100:
            self.rating = 100

        self.matchesPlayed += 1
        self.tournamentRound += 1



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
        return 1000 + 200 * self.difficulty

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


class Main(object):
    def __init__(self):
        self.getGames()
        self.getRules()
        self.getPokemon()

        self.testMatch()

    def getGames(self):
        self.gamesList = []
        with open('data/games.json', 'r') as fp:
            gamesData = json.load(fp)
        gamesData = gamesData['Games']
        for game in gamesData:
            self.gamesList.append(Game(game['Name'], game['Generation'], game['Region'], game['Difficulty']))

    def getRules(self):
        self.rulesList = []
        with open('data/rules.json', 'r') as fp:
            rulesData = json.load(fp)
        rulesData = rulesData['Rules']
        for rule in rulesData:
            self.rulesList.append(Rule(rule['Name'], rule['Difficulty']))

    def getPokemon(self):
        self.pokemonList = []
        with open('data/pokemon-ranks.json', 'r') as fp:
            pokemonData = json.load(fp)
        for pokemon, ranks in pokemonData.items():
            self.pokemonList.append(Pokemon(pokemon, ranks))

    def findGame(self, gameName):
        for game in self.gamesList:
            if game.name == gameName:
                return game
        return None

    def findRule(self, ruleName):
        for rule in self.rulesList:
            if rule.name == ruleName:
                return rule
        return None

    def findPokemon(self, pokemonName):
        for pokemon in self.pokemonList:
            if pokemon.name == pokemonName:
                return pokemon
        return None

    def testMatch(self):
        xerxos = Player('Xerxos', 1000)
        xerxos.match(self.findGame('Crystal'), 0)
        xerxos.match(self.findGame('Crystal'), 0)
        xerxos.match(self.findGame('Crystal'), 0)
        xerxos.match(self.findGame('Crystal'), 0)
        xerxos.match(self.findGame('Crystal'), 0)
        print(xerxos.rating)
        print(xerxos.matchesPlayed)
        print(xerxos.tournamentRound)

main = Main()