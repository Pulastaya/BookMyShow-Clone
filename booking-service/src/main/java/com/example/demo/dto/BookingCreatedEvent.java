package com.example.demo.dto;

import java.io.Serializable;

public class BookingCreatedEvent implements Serializable {
    private Long bookingId;
    private Long showId;
    private String customerName;
    private String customerEmail;
    private String seatNumbers;
    private Integer totalSeats;
    private Double totalAmount;
    private String movieTitle;
    private String showTime;
    private String theaterName;
    private String screenName;

    public BookingCreatedEvent() {}

    public BookingCreatedEvent(Long bookingId, Long showId, String customerName, String customerEmail,
                               String seatNumbers, Integer totalSeats, Double totalAmount,
                               String movieTitle, String showTime, String theaterName, String screenName) {
        this.bookingId = bookingId;
        this.showId = showId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.seatNumbers = seatNumbers;
        this.totalSeats = totalSeats;
        this.totalAmount = totalAmount;
        this.movieTitle = movieTitle;
        this.showTime = showTime;
        this.theaterName = theaterName;
        this.screenName = screenName;
    }

    // Getters and Setters
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

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

    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }

    public String getShowTime() { return showTime; }
    public void setShowTime(String showTime) { this.showTime = showTime; }

    public String getTheaterName() { return theaterName; }
    public void setTheaterName(String theaterName) { this.theaterName = theaterName; }

    public String getScreenName() { return screenName; }
    public void setScreenName(String screenName) { this.screenName = screenName; }
}
