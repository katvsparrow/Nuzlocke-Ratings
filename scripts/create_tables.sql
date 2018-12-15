CREATE DATABASE IF NOT EXISTS `nrs`;

-- --------------- --
-- Create tables   --
-- --------------- --

CREATE TABLE IF NOT EXISTS `Player` (
    `player_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` varchar(255) NOT NULL,
    `rating` int NOT NULL DEFAULT 1000,
    `matches_played` int NOT NULL DEFAULT 0,
    `tournament_round` int DEFAULT 1,
    `avatar` varchar(255) DEFAULT NULL,
    `email` varchar(255),
    `forum_link` varchar(255) DEFAULT NULL,
    `discord` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `BaseGame` (
    `basegame_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `basegame_name` varchar(255) NOT NULL,
    `generation` tinyint(1) NOT NULL,
    `region` enum('Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola') NOT NULL,
    `difficulty` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `Rule` (
    `rule_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `rule_name` varchar(255) NOT NULL,
    `difficulty` tinyint(1) NOT NULL  
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `Pokemon` (
    `pokemon_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `pokemon_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `Title` (
    `title_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title_name` varchar(32) NOT NULL,
    `title_abbrev` varchar(3) NOT NULL,
    `rating_floor` int NOT NULL,
    `min_challenges` tinyint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- --------------------- --
-- Relationship tables   --
-- --------------------- --

CREATE TABLE IF NOT EXISTS `Party` (
    `party_id` int AUTO_INCREMENT PRIMARY KEY,
    `pkmn_id` int NOT NULL,
    -- `pkmn2` int,
    -- `pkmn3` int,
    -- `pkmn4` int,
    -- `pkmn5` int,
    -- `pkmn6` int,
    `runid` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `Ruleset` (
    `ruleset_id` int AUTO_INCREMENT PRIMARY KEY,
    `ruleid` int NOT NULL,
    `runid` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `Run` (
    `run_id` int AUTO_INCREMENT PRIMARY KEY,
    `run_name` varchar(255) NOT NULL,
    `pid` int NOT NULL,
    `bid` int NOT NULL,
    `link` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `Basegame_Pokemon` (
    `basegame_pokemon_id` int AUTO_INCREMENT PRIMARY KEY,
    `bid` int NOT NULL,
    `pkmn` int,
    `rank` enum('S', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'E')
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- CREATE TABLE IF NOT EXISTS `Game_Rule` (
--     `game_rule_id` int AUTO_INCREMENT PRIMARY KEY,
--     `gid` int NOT NULL,
--     `rid` int NOT NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- ------------- --
-- Constraints   --
-- ------------- --

-- Add constraints to 'Party'
ALTER TABLE `Party`
ADD CONSTRAINT `fk_party_pkmn_id` FOREIGN KEY (`pkmn_id`) REFERENCES `Pokemon`(`pokemon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
-- ADD CONSTRAINT `fk_party_pkmn2` FOREIGN KEY (`pkmn2`) REFERENCES `Pokemon`(`pokemon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
-- ADD CONSTRAINT `fk_party_pkmn3` FOREIGN KEY (`pkmn3`) REFERENCES `Pokemon`(`pokemon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
-- ADD CONSTRAINT `fk_party_pkmn4` FOREIGN KEY (`pkmn4`) REFERENCES `Pokemon`(`pokemon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
-- ADD CONSTRAINT `fk_party_pkmn5` FOREIGN KEY (`pkmn5`) REFERENCES `Pokemon`(`pokemon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
-- ADD CONSTRAINT `fk_party_pkmn6` FOREIGN KEY (`pkmn6`) REFERENCES `Pokemon`(`pokemon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_party_runid` FOREIGN KEY (`runid`) REFERENCES `Run`(`run_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add constraints to 'Ruleset'
ALTER TABLE `Ruleset`
ADD CONSTRAINT `fk_ruleset_ruleid` FOREIGN KEY (`ruleid`) REFERENCES `Rule`(`rule_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_ruleset_runid` FOREIGN KEY (`runid`) REFERENCES `Run`(`run_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add constraints to 'Run'
ALTER TABLE `Run`
ADD CONSTRAINT `fk_run_pid` FOREIGN KEY (`pid`) REFERENCES `Player`(`player_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT  `fk_run_gid` FOREIGN KEY (`bid`) REFERENCES `Basegame`(`basegame_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add constraints to 'Basegame_Pokemon'
ALTER TABLE `Basegame_Pokemon`
ADD CONSTRAINT `fk_bp_gid` FOREIGN KEY (`bid`) REFERENCES `Basegame`(`basegame_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_bp_pkmn` FOREIGN KEY (`pkmn`) REFERENCES `Pokemon`(`pokemon_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- -- Add constraints to 'Game_Rule'
-- ALTER TABLE `Game_Rule`
-- ADD CONSTRAINT `fk_gr_gid` FOREIGN KEY (`gid`) REFERENCES `Game`(`game_id`) ON DELETE CASCADE ON UPDATE CASCADE,
-- ADD CONSTRAINT `fk_gr_rid` FOREIGN KEY (`rid`) REFERENCES `Rule`(`rule_id`) ON DELETE CASCADE ON UPDATE CASCADE;