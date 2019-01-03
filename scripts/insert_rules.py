import json

with open('data/rules.json', 'r') as fp:
    rules = json.load(fp)


rulesQuery = "\
INSERT INTO Rule(name, difficulty, description) \
VALUES (\"%s\", %s, \"%s\");\n"

with open('insert_rules.sql', 'w') as fp:
    for rule in rules['Rules']:
        name = rule['Name']
        difficulty = rule['Difficulty']
        description = rule['Description']
        fp.write(rulesQuery % (name, difficulty, description))
