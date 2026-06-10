package com.example.demo.repository;

import com.example.demo.model.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShowRepository extends JpaRepository<Show, Long> {
    List<Show> findByMovieId(Long movieId);
    List<Show> findByMovieIdAndTheaterCityIgnoreCase(Long movieId, String city);
    List<Show> findByMovieIdAndTheaterId(Long movieId, Long theaterId);
    List<Show> findByTheaterCityIgnoreCase(String city);
    List<Show> findByTheaterId(Long theaterId);
}
