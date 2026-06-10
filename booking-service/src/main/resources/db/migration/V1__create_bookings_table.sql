CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    show_id BIGINT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    seat_numbers VARCHAR(255) NOT NULL,
    total_seats INT NOT NULL,
    total_amount DOUBLE NOT NULL,
    booking_time DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL
);

CREATE INDEX idx_booking_show_id ON bookings(show_id);
CREATE INDEX idx_booking_customer_email ON bookings(customer_email);
