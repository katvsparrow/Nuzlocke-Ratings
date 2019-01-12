import json

with open('data/games.json', 'r') as fp:
    games = json.load(fp)


gamesQuery = "\
INSERT INTO Basegame(basegame_id, name, generation, region, difficulty) \
VALUES (%s, \"%s\", %s, \"%s\", \"%s\");\n"

with open('insert_games.sql', 'w') as fp:
    fp.write('DELETE FROM Basegame;\n\n')

    count = 1
    for game in games['Games']:
        name = game['Name']
        gen = game['Generation']
        region = game['Region']
        difficulty = game['Difficulty']
        fp.write(gamesQuery % (count, name, gen, region, difficulty))
        count = count + 1

    fp.write('\nALTER TABLE Basegame AUTO_INCREMENT = 0')
