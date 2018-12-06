CREATE DATABASE IF NOT EXISTS `nuzlocke_ratings`;

-- --------------- --
-- Create tables   --
-- --------------- --

CREATE TABLE IF NOT EXISTS `Player` (
    `player_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` varchar(255) NOT NULL,
    `rating` int NOT NULL DEFAULT 1000,
    `matches_played` int NOT NULL DEFAULT 0,
    `tournament_round` int DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `Game` (
    `game_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` varchar(255) NOT NULL,
    `generation` tinyint(1) NOT NULL,
    `region` enum('Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola') NOT NULL,
    `difficulty` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `Rule` (
    `rule_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` varchar(255) NOT NULL,
    `difficulty` tinyint(1) NOT NULL  
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `Pokemon` (
    `pokemon_id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- --------------------- --
-- Relationship tables   --
-- --------------------- --

CREATE TABLE IF NOT EXISTS `Party` (
    `party_id` int AUTO_INCREMENT PRIMARY KEY,
    `pkmn1` int NOT NULL,
    `pkmn2` int,
    `pkmn3` int,
    `pkmn4` int,
    `pkmn5` int,
    `pkmn6` int
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `Player_Game` (
    `player_game_id` int AUTO_INCREMENT PRIMARY KEY,
    `pid` int NOT NULL,
    `gid` int NOT NULL,
    `link` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `Game_Pokemon` (
    `game_pokemon_id` int AUTO_INCREMENT PRIMARY KEY,
    `gid` int NOT NULL,
    `pkmn` int,
    `party_id` int,
    `rank` enum('S', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'E')
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `Game_Rule` (
    `game_rule_id` int AUTO_INCREMENT PRIMARY KEY,
    `gid` int NOT NULL,
    `rid` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- ------------- --
-- Constraints   --
-- ------------- --

-- Add constraints to 'Party'
ALTER TABLE `Party`
ADD CONSTRAINT `fk_party_pkmn1` FOREIGN KEY (`pkmn1`) REFERENCES `Pokemon`(`pokemon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_party_pkmn2` FOREIGN KEY (`pkmn2`) REFERENCES `Pokemon`(`pokemon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_party_pkmn3` FOREIGN KEY (`pkmn3`) REFERENCES `Pokemon`(`pokemon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_party_pkmn4` FOREIGN KEY (`pkmn4`) REFERENCES `Pokemon`(`pokemon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_party_pkmn5` FOREIGN KEY (`pkmn5`) REFERENCES `Pokemon`(`pokemon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_party_pkmn6` FOREIGN KEY (`pkmn6`) REFERENCES `Pokemon`(`pokemon_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add constraints to 'Player_Game'
ALTER TABLE `Player_Game`
ADD CONSTRAINT `fk_pg_pid` FOREIGN KEY (`pid`) REFERENCES `Player`(`player_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT  `fk_pg_gid` FOREIGN KEY (`gid`) REFERENCES `Game`(`game_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add constraints to 'Game_Pokemon'
ALTER TABLE `Game_Pokemon`
ADD CONSTRAINT `fk_gp_gid` FOREIGN KEY (`gid`) REFERENCES `Game`(`game_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_gp_pkmn` FOREIGN KEY (`pkmn`) REFERENCES `Pokemon`(`pokemon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_gp_party` FOREIGN KEY (`party_id`) REFERENCES `Party`(`party_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add constraints to 'Game_Rule'
ALTER TABLE `Game_Rule`
ADD CONSTRAINT `fk_gr_gid` FOREIGN KEY (`gid`) REFERENCES `Game`(`game_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_gr_rid` FOREIGN KEY (`rid`) REFERENCES `Rule`(`rule_id`) ON DELETE CASCADE ON UPDATE CASCADE;