package com.example.demo.controller;

import com.example.demo.model.Movie;
import com.example.demo.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/movies")
@SuppressWarnings("null")
public class MovieController {

    @Autowired
    private MovieRepository movieRepository;

    @GetMapping
    public List<Movie> getAllMovies(@RequestParam(required = false) String search, @RequestParam(required = false) String city) {
        if (search != null && !search.trim().isEmpty()) {
            return movieRepository.findByTitleContainingIgnoreCase(search);
        } else if (city != null && !city.trim().isEmpty()) {
            return movieRepository.findMoviesByCity(city);
        }
        return movieRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id) {
        return movieRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
