package com.example.demo.repository;

import com.example.demo.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    
    List<Movie> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT DISTINCT s.movie FROM Show s WHERE LOWER(s.theater.city) = LOWER(:city)")
    List<Movie> findMoviesByCity(@Param("city") String city);
}
