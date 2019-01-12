-- Represents a single title.
--
-- Key: title_id
CREATE TABLE IF NOT EXISTS Title (
    title_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    abbreviation VARCHAR(3) NOT NULL,
    rating_floor SMALLINT NOT NULL,
    min_bronze_challenges TINYINT NOT NULL,
    min_silver_challenges TINYINT NOT NULL,
    min_gold_challenges TINYINT NOT NULL
) ENGINE=InnoDB;

-- Represents a single player.
--
-- Key: player_id
-- Foreign Key: title_id references Title table
CREATE TABLE IF NOT EXISTS Player (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    -- tournament_round int DEFAULT 1,
    -- avatar varchar(255) DEFAULT NULL,
    email VARCHAR(255),
    link VARCHAR(255),
    discord VARCHAR(32),
    rating INT DEFAULT 1000,
    runs_completed INT DEFAULT 0,
    challenges_completed INT DEFAULT 0,
    title_id INT,
    FOREIGN KEY (title_id) REFERENCES Title(title_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;


-- Represents a single Pokemon game version.
--
-- Key: basegame_id
CREATE TABLE IF NOT EXISTS Basegame (
    basegame_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generation TINYINT(1) NOT NULL,   
    region ENUM('Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola') NOT NULL,
    difficulty TINYINT(1) NOT NULL
) ENGINE=InnoDB;

-- Represents a single challenge.
--
-- Key: challenge_id
CREATE TABLE IF NOT EXISTS Challenge (
    challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    tier ENUM('Gold', 'Silver', 'Bronze', 'Leader') NOT NULL,
    classification ENUM('Multiple Runs', 'Single Run', 'Single Battle', 'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola') NOT NULL,
    description TEXT NOT NULL
) ENGINE=InnoDB;

-- Represents a single run owned by a player.
--
-- Player to Run is 1:n, i.e.,
-- 1 player can have multiple runs, but
-- 1 run can only belong to 1 player.
--
-- Run to Basegame is n:1, i.e.,
-- multiple runs can be played in the same game, but
-- 1 run can only have 1 game.
--
-- Key: run_id
-- Foreign Key: player_id references Player table
-- Foreign Key: basegame_id references Basegame table
CREATE TABLE IF NOT EXISTS Run (
    run_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    link varchar(255) NOT NULL,
    deaths INT NOT NULL,
    player_id INT NOT NULL,
    basegame_id INT NOT NULL,
    rating INT NOT NULL,
    FOREIGN KEY (player_id) REFERENCES Player(player_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (basegame_id) REFERENCES Basegame(basegame_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Represents a single challenge completed by a player.
--
-- Player to Challenge is m:n, i.e.,
-- 1 player can do multiple challenges, and
-- 1 challenge can be done by multiple players.
--
-- Key: player_id and challenge_id
-- Foreign Key: player_id references Player table
-- Foreign Key: challenge_id references Challenge table
-- Foreign Key: run_id references Run table
CREATE TABLE IF NOT EXISTS Player_Challenge (
    player_id INT NOT NULL,
    challenge_id INT NOT NULL,
    run_id INT NOT NULL,
    FOREIGN KEY (player_id) REFERENCES Player(player_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES Challenge(challenge_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (run_id) REFERENCES Run(run_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;


-- Represents a single Pokemon.
--
-- Key: pokemon_id
CREATE TABLE IF NOT EXISTS Pokemon (
    pokemon_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
) ENGINE=InnoDB;


-- Represents the relationship between Run and Pokemon, i.e.,
-- the final Pokemon team used in a single run.
--
-- Run to Pokemon is m:n, i.e.,
-- Multiple runs can have the same Pokemon, and
-- Multiple Pokemon can be used in the same run.
--
-- Key: run_id and pokemon_id
-- Foreign Key: run_id references Run table
-- Foreign Key: pokemon_id references Pokemon table
CREATE TABLE IF NOT EXISTS Party (
    run_id INT NOT NULL,
    pokemon_id INT NOT NULL,
    PRIMARY KEY (run_id, pokemon_id),
    FOREIGN KEY (run_id) REFERENCES Run(run_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (pokemon_id) REFERENCES Pokemon(pokemon_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;


-- Represents a single Nuzlocke rule.
--
-- Key: rule_id
CREATE TABLE IF NOT EXISTS Rule (
    rule_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    difficulty TINYINT(1) NOT NULL,
    description TEXT NOT NULL  
) ENGINE=InnoDB;


-- Represents the relationship between Run and Rule, i.e.,
-- the specific set of rules used in the run.
--
-- Run to Rule is m:n, i.e.,
-- multiple runs can use the same rule, and
-- multiple rules can be used in the same run.
--
-- Key: run_id and rule_id
-- Foreign Key: run_id references Run table
-- Foreign Key: rule_id references Rule table
CREATE TABLE IF NOT EXISTS Ruleset (
    run_id INT NOT NULL,
    rule_id INT NOT NULL,
    PRIMARY KEY (run_id, rule_id),
    FOREIGN KEY (run_id) REFERENCES Run(run_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (rule_id) REFERENCES Rule(rule_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;


-- Represents the relationship between Pokemon and Basegame, i.e.,
-- the rank of a Pokemon in a specific game version.
--
-- Pokemon to Basegame is m:n, i.e.,
-- multiple Pokemon can be in the same game, and
-- multiple games can include the same Pokemon.
--
-- Key: pokemon_id and basegame_id
-- Foreign Key: pokemon_id references Pokemon table
-- Foreign Key: basegame_id references Basegame table
CREATE TABLE IF NOT EXISTS Pokemon_Rank (
    pokemon_id INT NOT NULL,
    basegame_id INT NOT NULL,
    rank enum('S', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'E') NOT NULL,
    PRIMARY KEY (pokemon_id, basegame_id),
    FOREIGN KEY (pokemon_id) REFERENCES Pokemon(pokemon_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (basegame_id) REFERENCES Basegame(basegame_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;


DROP TRIGGER IF EXISTS update_runs_completed;
CREATE TRIGGER update_runs_completed AFTER INSERT ON Run
    FOR EACH ROW
        UPDATE Player
        SET runs_completed=(SELECT COUNT(*) FROM Run WHERE player_id=NEW.player_id)
        WHERE Player.player_id=NEW.player_id;

DROP TRIGGER IF EXISTS update_challenges_completed;
CREATE TRIGGER update_challenges_completed AFTER INSERT ON Player_Challenge
    FOR EACH ROW
        UPDATE Player
        SET challenges_completed=(SELECT COUNT(*) FROM Player_Challenge WHERE player_id=NEW.player_id)
        WHERE Player.player_id = NEW.player_id