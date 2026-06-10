package com.example.demo.controller;

import com.example.demo.model.Show;
import com.example.demo.repository.ShowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/shows")
@SuppressWarnings("null")
public class ShowController {

    @Autowired
    private ShowRepository showRepository;

    @GetMapping
    public List<Show> getShows(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Long theaterId) {
        
        if (movieId != null) {
            if (theaterId != null) {
                return showRepository.findByMovieIdAndTheaterId(movieId, theaterId);
            } else if (city != null && !city.trim().isEmpty()) {
                return showRepository.findByMovieIdAndTheaterCityIgnoreCase(movieId, city);
            }
            return showRepository.findByMovieId(movieId);
        } else {
            if (theaterId != null) {
                return showRepository.findByTheaterId(theaterId);
            } else if (city != null && !city.trim().isEmpty()) {
                return showRepository.findByTheaterCityIgnoreCase(city);
            }
        }
        return showRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Show> getShowById(@PathVariable Long id) {
        return showRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Show createShow(@RequestBody Show show) {
        return showRepository.save(show);
    }
}
