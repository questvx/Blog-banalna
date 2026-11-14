CREATE TABLE image_card_crops (
    file_name VARCHAR(255) NOT NULL,
    large_zoom_percent INT NOT NULL,
    large_position_x INT NOT NULL,
    large_position_y INT NOT NULL,
    small_zoom_percent INT NOT NULL,
    small_position_x INT NOT NULL,
    small_position_y INT NOT NULL,
    PRIMARY KEY (file_name)
);
