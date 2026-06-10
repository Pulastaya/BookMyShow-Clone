package com.example.demo.dto;

import java.time.LocalDateTime;

public class ShowResponse {
    private Long id;
    private MovieResponse movie;
    private TheaterResponse theater;
    private LocalDateTime showTime;
    private Double ticketPrice;
    private String screenName;

    public ShowResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MovieResponse getMovie() { return movie; }
    public void setMovie(MovieResponse movie) { this.movie = movie; }

    public TheaterResponse getTheater() { return theater; }
    public void setTheater(TheaterResponse theater) { this.theater = theater; }

    public LocalDateTime getShowTime() { return showTime; }
    public void setShowTime(LocalDateTime showTime) { this.showTime = showTime; }

    public Double getTicketPrice() { return ticketPrice; }
    public void setTicketPrice(Double ticketPrice) { this.ticketPrice = ticketPrice; }

    public String getScreenName() { return screenName; }
    public void setScreenName(String screenName) { this.screenName = screenName; }
}
