package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long showId;
    private String customerName;
    private String customerEmail;
    
    // Storing seats as a comma-separated string, e.g., "A3,A4"
    private String seatNumbers;
    
    private Integer totalSeats;
    private Double totalAmount;
    private LocalDateTime bookingTime;
    private String status; // CONFIRMED, CANCELLED

    // Constructors
    public Booking() {}

    public Booking(Long showId, String customerName, String customerEmail, String seatNumbers, Integer totalSeats, Double totalAmount, LocalDateTime bookingTime, String status) {
        this.showId = showId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.seatNumbers = seatNumbers;
        this.totalSeats = totalSeats;
        this.totalAmount = totalAmount;
        this.bookingTime = bookingTime;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getShowId() { return showId; }
    public void setShowId(Long showId) { this.showId = showId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(String seatNumbers) { this.seatNumbers = seatNumbers; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
