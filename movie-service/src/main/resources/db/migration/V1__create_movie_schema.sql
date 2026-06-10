CREATE TABLE IF NOT EXISTS movies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(255),
    duration_minutes INT,
    language VARCHAR(255),
    description VARCHAR(1000),
    rating DOUBLE,
    poster_url VARCHAR(255),
    release_date DATE
);

CREATE TABLE IF NOT EXISTS theaters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    address VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS shows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    theater_id BIGINT NOT NULL,
    show_time DATETIME NOT NULL,
    ticket_price DOUBLE NOT NULL,
    screen_name VARCHAR(255),

    CONSTRAINT fk_show_movie
        FOREIGN KEY (movie_id)
        REFERENCES movies(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_show_theater
        FOREIGN KEY (theater_id)
        REFERENCES theaters(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_show_movie_id ON shows(movie_id);
CREATE INDEX idx_show_theater_id ON shows(theater_id);
CREATE INDEX idx_theater_city ON theaters(city);