package com.example.demo.service;

import com.example.demo.dto.BookingCreatedEvent;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${spring.mail.from:noreply@bookmyshow.com}")
    private String fromEmail;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Retryable(
        retryFor = {Exception.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 5000)
    )
    public void sendBookingEmail(BookingCreatedEvent event) throws Exception {
        String toEmail = event.getCustomerEmail();
        String customerName = event.getCustomerName();
        String movieTitle = event.getMovieTitle();
        String showTime = event.getShowTime();
        String theaterName = event.getTheaterName();
        String screenName = event.getScreenName();
        String seats = event.getSeatNumbers();
        Double totalAmount = event.getTotalAmount();

        String subject = "Booking Confirmed - BookMyShow Clone";
        
        String htmlContent = String.format(
            "<html>\n" +
            "<body style='font-family: Arial, sans-serif; color: #333;'>\n" +
            "  <div style='max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>\n" +
            "    <div style='background: linear-gradient(135deg, #e50914, #9f0007); padding: 20px; text-align: center; color: white;'>\n" +
            "      <h1 style='margin: 0; font-size: 24px; letter-spacing: 1px;'>BOOKMYSHOW CLONE</h1>\n" +
            "      <p style='margin: 5px 0 0 0; font-size: 14px;'>Booking Confirmation Receipt</p>\n" +
            "    </div>\n" +
            "    <div style='padding: 25px;'>\n" +
            "      <h2 style='color: #111; margin-top: 0;'>Hello %s,</h2>\n" +
            "      <p style='font-size: 15px; line-height: 1.6; color: #555;'>Your movie ticket booking is confirmed! Below are the details of your ticket:</p>\n" +
            "      \n" +
            "      <div style='background-color: #f9f9f9; border-left: 4px solid #e50914; padding: 15px; margin: 20px 0;'>\n" +
            "        <table style='width: 100%%; border-collapse: collapse;'>\n" +
            "          <tr>\n" +
            "            <td style='padding: 6px 0; font-weight: bold; width: 30%%; color: #666;'>Movie</td>\n" +
            "            <td style='padding: 6px 0; color: #111; font-weight: bold;'>%s</td>\n" +
            "          </tr>\n" +
            "          <tr>\n" +
            "            <td style='padding: 6px 0; font-weight: bold; color: #666;'>Show Time</td>\n" +
            "            <td style='padding: 6px 0; color: #111;'>%s</td>\n" +
            "          </tr>\n" +
            "          <tr>\n" +
            "            <td style='padding: 6px 0; font-weight: bold; color: #666;'>Theater</td>\n" +
            "            <td style='padding: 6px 0; color: #111;'>%s (%s)</td>\n" +
            "          </tr>\n" +
            "          <tr>\n" +
            "            <td style='padding: 6px 0; font-weight: bold; color: #666;'>Seats</td>\n" +
            "            <td style='padding: 6px 0; color: #e50914; font-weight: bold;'>%s</td>\n" +
            "          </tr>\n" +
            "          <tr>\n" +
            "            <td style='padding: 6px 0; font-weight: bold; color: #666;'>Amount Paid</td>\n" +
            "            <td style='padding: 6px 0; color: #111; font-weight: bold;'>Rs. %.2f</td>\n" +
            "          </tr>\n" +
            "        </table>\n" +
            "      </div>\n" +
            "      \n" +
            "      <p style='font-size: 14px; color: #777; line-height: 1.5;'>Please present this confirmation at the theater counter to collect your physical tickets. Enjoy your show!</p>\n" +
            "    </div>\n" +
            "    <div style='background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0;'>\n" +
            "      This is an automated receipt from BookMyShow Clone. Please do not reply directly to this mail.\n" +
            "    </div>\n" +
            "  </div>\n" +
            "</body>\n" +
            "</html>",
            customerName, movieTitle, showTime, theaterName, screenName, seats, totalAmount
        );

        logger.info("========================================= EMAIL TRANSMISSION LOG =========================================");
        logger.info("Recipient Email: {}", toEmail);
        logger.info("Subject: {}", subject);
        logger.info("Content:\n{}", htmlContent);
        logger.info("=========================================================================================================");

        if (mailSender == null) {
            logger.warn("JavaMailSender is NOT configured (SMTP properties are missing or empty). Mocking email dispatch to standard console logs above.");
            return;
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
        logger.info("Successfully dispatched email confirmation to {}", toEmail);
    }

    @Recover
    public void recover(Exception e, BookingCreatedEvent event) {
        logger.error("FATAL: Failed to send booking confirmation email to {} after 3 attempts. Error: {}", 
                event.getCustomerEmail(), e.getMessage());
    }
}
