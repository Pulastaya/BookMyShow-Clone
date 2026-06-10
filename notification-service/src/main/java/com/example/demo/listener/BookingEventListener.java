package com.example.demo.listener;

import com.example.demo.config.RabbitMQConfig;
import com.example.demo.dto.BookingCreatedEvent;
import com.example.demo.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class BookingEventListener {
    private static final Logger logger = LoggerFactory.getLogger(BookingEventListener.class);

    @Autowired
    private EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void handleBookingCreatedEvent(BookingCreatedEvent event) {
        logger.info("Received BookingCreatedEvent from RabbitMQ for Booking ID: {}", event.getBookingId());
        try {
            emailService.sendBookingEmail(event);
        } catch (Exception e) {
            logger.error("Error handling BookingCreatedEvent: {}", e.getMessage());
        }
    }
}
