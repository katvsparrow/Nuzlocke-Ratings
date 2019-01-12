DELETE FROM Title;

INSERT INTO Title
    (
    title_id,
    name,
    abbreviation,
    rating_floor,
    min_bronze_challenges,
    min_silver_challenges,
    min_gold_challenges
    )
VALUES
    ( 1, 'Nuzlocke Expert', 'NEX', 2000, 0, 0, 0 ),
    ( 2, 'Nuzlocke Master', 'NM', 2200, 2, 0, 0 ),
    ( 3, 'Nuzlocke Elite', 'NE', 2300, 2, 2, 0 ),
    ( 4, 'Nuzlocke Virtuoso', 'NV', 2400, 3, 3, 0 ),
    ( 5, 'Nuzlocke Grandmaster', 'NGM', 2500, 3, 3, 3 ),
    ( 6, 'Nuzlocke Champion', 'NC', 2700, 5, 5, 5 );

ALTER TABLE Title AUTO_INCREMENT = 0;