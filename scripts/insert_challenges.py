import json

with open('data/challenges.json', 'r') as fp:
    challenges = json.load(fp)

challengesQuery = "\
INSERT INTO Challenge(name, tier, classification, description) \
VALUES (\"%s\", \"%s\", \"%s\", \"%s\");\n"

with open('insert_challenges.sql', 'w') as fp:
    for challenge in challenges:
        name = challenge['Name']
        tier = challenge['Tier']
        classification = challenge['Classification']
        description = challenge['Description']
        fp.write(challengesQuery % (name, tier, classification, description))