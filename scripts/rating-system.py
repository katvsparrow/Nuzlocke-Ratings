import json
from math import floor

class Player(object):
    def __init__(self, name, rating = 1000, matchesPlayed = 0, tournamentRound = 1):
        self.name = name
        self.rating = rating
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
    
    def completeRun(self, game, numDeaths, ruleset = None, team = None):
        try:
            game.deaths
        except AttributeError:
            game.setDeaths(numDeaths)
        
        try: 
            game.ruleset
        except AttributeError:
            if ruleset:
                game.setRuleset(ruleset)
        
        try:
            game.team
        except AttributeError:
            if team:
                game.setTeam(team)
        
        if game.rating < 100:
            game.rating = 100

        self.expectedScore = self.getExpectedScore(game.rating)
        self.k = self.calculateK()
        print(self.rating, game.rating)
        self.rating = self.adjustRating(1)
        
        if self.rating < 100:
            self.rating = 100

        self.matchesPlayed += 1
        self.tournamentRound += 1

    def printPlayer(self):
        print('Name: ', self.name)
        print('Rating: ', self.rating)
        print('Matches Played: ', self.matchesPlayed)
        print('Current Tournament Round: ', self.tournamentRound)
        print('----------------------------------')



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
        if type(self.ruleset) == Rule:
            self.rating += 50 * self.ruleset.difficulty
        else:
            for rule in self.ruleset:
                self.rating += 50 * rule.difficulty

    
    def setDeaths(self, deaths):
        self.deaths = deaths
        self.addDeathModifiers()

    def addDeathModifiers(self):
        self.rating += self.translateDeathCount(self.deaths)

    def translateDeathCount(self, x): 
        if x == 5:
            return 0
        elif x == 4:
            return 25
        elif x == 6:
            return -25
        elif x < 4:
            return 2 * self.translateDeathCount(x + 1)
        elif x > 6:
            return 2 * self.translateDeathCount(x - 1)

    def setTeam(self, team):
        self.team = team
        self.addTeamModifiers()

    def addTeamModifiers(self):
        if type(self.team) == Pokemon:
            self.rating += self.team.ranks[self.name]
        else:
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
        self.getPlayers()

        # self.testPrint(self.playerList)
        self.testMatch()
        # self.testDump()

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

    def getPlayers(self):
        self.playerList = []
        with open('data/players.json', 'r') as fp:
            playerData = json.load(fp)
        for player, vals in playerData.items():
            self.playerList.append(Player(player, vals['rating'], vals['matchesPlayed'], vals['tournamentRound']))

    def dumpPlayers(self):
        with open('data/players.json', 'w') as fp:
            fp.write('{\n')
            for player in self.playerList:
                fp.write('\t' + '\"' + player.name + '\": ' +  json.dumps(player.__dict__))
                if player != self.playerList[-1]:
                    fp.write(',\n')
            fp.write('\n}')

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
        run = self.findGame('Platinum')
        xerxos.completeRun(run, 0, self.findRule('Superless'), self.findPokemon('Combee'))
        print('Final rating: ', xerxos.rating)
        print('Matches played: ', xerxos.matchesPlayed)
        print('Current tournament round: ', xerxos.tournamentRound)
    
    def testDump(self):
        self.playerList = []
        for i in range(10):
            self.playerList.append(Player(str(i)))
        self.dumpPlayers()

    def testPrint(self, objList):
        for obj in objList:
            if type(obj) == Player:
                obj.printPlayer()
            elif type(obj) == Game:
                obj.printGame()
            elif type(obj) == Rule:
                obj.printRule
            elif type(obj) == Pokemon:
                obj.printPokemon

main = Main()