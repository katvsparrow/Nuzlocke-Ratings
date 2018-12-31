import json

with open('data/games.json', 'r') as fp:
    games = json.load(fp)


gamesQuery = "\
INSERT INTO Basegame(name, generation, region, difficulty) \
VALUES (\"%s\", %s, \"%s\", \"%s\");\n"

with open('insert_games.sql', 'w') as fp:
    for game in games['Games']:
        name = game['Name']
        gen = game['Generation']
        region = game['Region']
        difficulty = game['Difficulty']
        fp.write(gamesQuery % (name, gen, region, difficulty))
