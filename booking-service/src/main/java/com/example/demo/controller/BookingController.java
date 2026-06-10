package com.example.demo.controller;

import com.example.demo.dto.ShowResponse;
import com.example.demo.dto.BookingCreatedEvent;
import com.example.demo.model.Booking;
import com.example.demo.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @GetMapping("/show/{showId}/seats")
    public List<String> getBookedSeatsForShow(@PathVariable Long showId) {
        List<Booking> bookings = bookingRepository.findByShowId(showId);
        List<String> bookedSeats = new ArrayList<>();
        
        for (Booking booking : bookings) {
            if ("CONFIRMED".equalsIgnoreCase(booking.getStatus()) && booking.getSeatNumbers() != null) {
                String[] seats = booking.getSeatNumbers().split(",");
                for (String seat : seats) {
                    if (!seat.trim().isEmpty()) {
                        bookedSeats.add(seat.trim());
                    }
                }
            }
        }
        return bookedSeats;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking bookingRequest) {
        // Validate request
        if (bookingRequest.getShowId() == null || bookingRequest.getSeatNumbers() == null || bookingRequest.getSeatNumbers().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid booking request: showId and seatNumbers are required");
        }

        List<String> requestedSeats = Arrays.stream(bookingRequest.getSeatNumbers().split(","))
                .map(String::trim)
                .collect(Collectors.toList());

        // 1. Acquire Redis Locks for all requested seats to prevent concurrent double-booking
        List<String> acquiredLocks = new ArrayList<>();
        boolean allLocksAcquired = true;

        for (String seat : requestedSeats) {
            String lockKey = "lock:show:" + bookingRequest.getShowId() + ":seat:" + seat;
            // Attempt to acquire lock for 5 minutes
            Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofMinutes(5));
            if (Boolean.TRUE.equals(acquired)) {
                acquiredLocks.add(lockKey);
            } else {
                allLocksAcquired = false;
                break;
            }
        }

        if (!allLocksAcquired) {
            // Rollback acquired locks
            for (String lockKey : acquiredLocks) {
                redisTemplate.delete(lockKey);
            }
            return ResponseEntity.status(409).body("One or more selected seats are currently locked by another customer. Please choose other seats.");
        }

        try {
            // 2. Check seat availability in database
            List<String> bookedSeats = getBookedSeatsForShow(bookingRequest.getShowId());
            for (String seat : requestedSeats) {
                if (bookedSeats.contains(seat)) {
                    // Release locks and return error
                    for (String lockKey : acquiredLocks) {
                        redisTemplate.delete(lockKey);
                    }
                    return ResponseEntity.badRequest().body("Seat " + seat + " is already booked.");
                }
            }

            // 3. Process and persist booking
            bookingRequest.setBookingTime(LocalDateTime.now());
            bookingRequest.setStatus("CONFIRMED");
            if (bookingRequest.getTotalSeats() == null) {
                bookingRequest.setTotalSeats(requestedSeats.size());
            }
            
            Booking savedBooking = bookingRepository.save(bookingRequest);

            // 4. Fetch show metadata and publish booking event to RabbitMQ
            try {
                String url = "http://MOVIE-SERVICE/api/shows/" + savedBooking.getShowId();
                ShowResponse show = restTemplate.getForObject(url, ShowResponse.class);
                if (show != null && savedBooking.getCustomerEmail() != null && !savedBooking.getCustomerEmail().trim().isEmpty()) {
                    String movieTitle = show.getMovie() != null ? show.getMovie().getTitle() : "Unknown Movie";
                    String theaterName = show.getTheater() != null ? show.getTheater().getName() : "Unknown Theater";
                    String screenName = show.getScreenName() != null ? show.getScreenName() : "Main Screen";
                    String showTimeStr = show.getShowTime() != null ? show.getShowTime().toString() : "N/A";
                    
                    BookingCreatedEvent event = new BookingCreatedEvent(
                        savedBooking.getId(),
                        savedBooking.getShowId(),
                        savedBooking.getCustomerName() != null ? savedBooking.getCustomerName() : "Valued Customer",
                        savedBooking.getCustomerEmail(),
                        savedBooking.getSeatNumbers(),
                        savedBooking.getTotalSeats(),
                        savedBooking.getTotalAmount(),
                        movieTitle,
                        showTimeStr,
                        theaterName,
                        screenName
                    );

                    // Publish to RabbitMQ exchange
                    rabbitTemplate.convertAndSend("booking-exchange", "booking.created", event);
                }
            } catch (Exception e) {
                System.err.println("Failed to fetch show metadata or publish event: " + e.getMessage());
            }

            // 5. Release locks now that the booking is officially persisted
            for (String lockKey : acquiredLocks) {
                redisTemplate.delete(lockKey);
            }

            return ResponseEntity.ok(savedBooking);

        } catch (Exception e) {
            // Release locks in case of error
            for (String lockKey : acquiredLocks) {
                redisTemplate.delete(lockKey);
            }
            throw e;
        }
    }

    @GetMapping("/customer/{email}")
    public List<Booking> getBookingsByCustomer(@PathVariable String email) {
        return bookingRepository.findByCustomerEmail(email);
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}
