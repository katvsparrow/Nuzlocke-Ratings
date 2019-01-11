import json

with open('data/rules.json', 'r') as fp:
    rules = json.load(fp)


rulesQuery = "\
INSERT INTO Rule(rule_id, name, difficulty, description) \
VALUES (%s, \"%s\", %s, \"%s\");\n"

with open('insert_rules.sql', 'w') as fp:
    fp.write('DELETE FROM Rule;\n\n')

    count = 1
    for rule in rules['Rules']:
        name = rule['Name']
        difficulty = rule['Difficulty']
        description = rule['Description']
        fp.write(rulesQuery % (count, name, difficulty, description))
        count = count + 1

    fp.write('\nALTER TABLE Rule AUTO_INCREMENT = 0')
