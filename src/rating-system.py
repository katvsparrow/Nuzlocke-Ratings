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

    def addRulesetModifiers(self):
        for rule in self.ruleset:
            self.rating += 50 * rule.difficulty

    def printGame(self):
        print(self.name, self.generation, self.region, self.difficulty, self.ruleset, sep=' | ')

    def addRule(self, rule):
        self.ruleset.append(rule)

    def setRuleset(self, ruleset):
        self.ruleset = ruleset
        self.addRulesetModifiers()



class Rule(object):
    def __init__(self, name, difficulty):
        self.name = name
        self.difficulty = difficulty
        self.ratingBonus = self.getRatingBonus()

    def getRatingBonus(self):
        return self.difficulty * 50

    def printRule(self):
        print(self.name, self.difficulty, sep=' | ')



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

gamesList = getGames()
rulesList = getRules()