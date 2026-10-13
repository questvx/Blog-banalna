CREATE TABLE horoscope_weeks (
    id BIGINT NOT NULL AUTO_INCREMENT,
    week_start DATE NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_horoscope_weeks_week_start UNIQUE (week_start)
);

CREATE TABLE horoscope_entries (
    week_id BIGINT NOT NULL,
    zodiac_sign VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    PRIMARY KEY (week_id, zodiac_sign),
    CONSTRAINT fk_horoscope_entries_week
        FOREIGN KEY (week_id) REFERENCES horoscope_weeks (id) ON DELETE CASCADE
);
