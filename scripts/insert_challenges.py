import json

with open('data/challenges.json', 'r') as fp:
    challenges = json.load(fp)

challengesQuery = "\
INSERT INTO Challenge(challenge_id, name, tier, classification, description) \
VALUES (%s, \"%s\", \"%s\", \"%s\", \"%s\");\n"

with open('insert_challenges.sql', 'w') as fp:
    fp.write('DELETE FROM Challenge;\n\n')

    count = 1
    for challenge in challenges:
        name = challenge['Name']
        tier = challenge['Tier']
        classification = challenge['Classification']
        description = challenge['Description']
        fp.write(challengesQuery %
                 (count, name, tier, classification, description))
        count = count + 1

    fp.write('\nALTER TABLE Challenge AUTO_INCREMENT = 0')
