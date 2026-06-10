package com.example.demo.controller;

import com.example.demo.model.Theater;
import com.example.demo.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping({"/api/theaters", "/api/theatres"})
@SuppressWarnings("null")
public class TheaterController {

    @Autowired
    private TheaterRepository theaterRepository;

    @GetMapping
    public List<Theater> getTheaters(@RequestParam(required = false) String city) {
        if (city != null && !city.trim().isEmpty()) {
            return theaterRepository.findByCityIgnoreCase(city);
        }
        return theaterRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Theater> getTheaterById(@PathVariable Long id) {
        return theaterRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Theater createTheater(@RequestBody Theater theater) {
        return theaterRepository.save(theater);
    }
}
