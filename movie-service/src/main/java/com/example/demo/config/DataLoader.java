package com.example.demo.config;

import com.example.demo.model.Movie;
import com.example.demo.model.Show;
import com.example.demo.model.Theater;
import com.example.demo.repository.MovieRepository;
import com.example.demo.repository.ShowRepository;
import com.example.demo.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@SuppressWarnings("null")
public class DataLoader implements CommandLineRunner {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private ShowRepository showRepository;

    @Override
    public void run(String... args) throws Exception {
        if (movieRepository.count() > 0) {
            return; // Data already seeded
        }

        // Seed Movies
        Movie m1 = new Movie(
            "Avengers: Endgame", 
            "Action, Sci-Fi", 
            181, 
            "English", 
            "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.", 
            8.8, 
            "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=400", 
            LocalDate.of(2019, 4, 26)
        );

        Movie m2 = new Movie(
            "Inception", 
            "Sci-Fi, Action", 
            148, 
            "English", 
            "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.", 
            8.8, 
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400", 
            LocalDate.of(2010, 7, 16)
        );

        Movie m3 = new Movie(
            "The Dark Knight", 
            "Action, Crime", 
            152, 
            "English", 
            "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.", 
            9.0, 
            "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=400", 
            LocalDate.of(2008, 7, 18)
        );

        Movie m4 = new Movie(
            "Interstellar", 
            "Sci-Fi, Drama", 
            169, 
            "English", 
            "When Earth becomes uninhabitable, a team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival.", 
            8.7, 
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400", 
            LocalDate.of(2014, 11, 7)
        );

        Movie m5 = new Movie(
            "La La Land", 
            "Romance, Comedy, Musical", 
            128, 
            "English", 
            "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.", 
            8.0, 
            "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400", 
            LocalDate.of(2016, 12, 9)
        );

        Movie m6 = new Movie(
            "Avatar: The Way of Water", 
            "Sci-Fi, Action, Adventure", 
            192, 
            "English", 
            "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home.", 
            7.6, 
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400", 
            LocalDate.of(2022, 12, 16)
        );

        Movie m7 = new Movie(
            "Spider-Man: Into the Spider-Verse", 
            "Animation, Action, Adventure", 
            117, 
            "English", 
            "Teen Miles Morales becomes the Spider-Man of his universe, and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.", 
            8.4, 
            "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=400", 
            LocalDate.of(2018, 12, 14)
        );

        Movie m8 = new Movie(
            "Parasite", 
            "Drama, Thriller", 
            132, 
            "Korean", 
            "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.", 
            8.5, 
            "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=400", 
            LocalDate.of(2019, 5, 30)
        );

        Movie m9 = new Movie(
            "The Matrix", 
            "Sci-Fi, Action", 
            136, 
            "English", 
            "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.", 
            8.7, 
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400", 
            LocalDate.of(1999, 3, 31)
        );

        // Seed Hindi Movies
        Movie m10 = new Movie(
            "Dangal", 
            "Action, Biography, Drama", 
            161, 
            "Hindi", 
            "Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle for glory at the Commonwealth Games in the face of societal oppression.", 
            8.3, 
            "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=400", 
            LocalDate.of(2016, 12, 23)
        );

        Movie m11 = new Movie(
            "3 Idiots", 
            "Comedy, Drama", 
            170, 
            "Hindi", 
            "Two friends are searching for their long lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently, even as the world called them idiots.", 
            8.4, 
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400", 
            LocalDate.of(2009, 12, 25)
        );

        Movie m12 = new Movie(
            "Sholay", 
            "Action, Adventure, Comedy", 
            204, 
            "Hindi", 
            "After his family is murdered by a notorious bandit, a retired police officer enlists the services of two outlaws to capture him.", 
            8.1, 
            "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=400", 
            LocalDate.of(1975, 8, 15)
        );

        Movie m13 = new Movie(
            "Jawan", 
            "Action, Thriller", 
            168, 
            "Hindi", 
            "A high-octane action thriller which outlines the emotional journey of a man who is set to rectify the wrongs in the society.", 
            7.0, 
            "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=400", 
            LocalDate.of(2023, 9, 7)
        );

        List<Movie> movies = movieRepository.saveAll(Arrays.asList(m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13));

        // Seed Theaters
        Theater t1 = new Theater("PVR Directors Cut", "Mumbai", "Ambience Mall, Vasant Kunj");
        Theater t2 = new Theater("INOX Laserplex", "Mumbai", "Nariman Point");
        Theater t3 = new Theater("Cinepolis VIP", "Delhi", "Saket");
        Theater t4 = new Theater("Carnival Cinemas", "Delhi", "Connaught Place");
        Theater t5 = new Theater("PVR Superplex", "Bangalore", "Koramangala");
        Theater t6 = new Theater("INOX Forum Mall", "Bangalore", "Whitefield");

        List<Theater> theaters = theaterRepository.saveAll(Arrays.asList(t1, t2, t3, t4, t5, t6));

        // Seed Shows (for today and next 2 days)
        LocalDateTime now = LocalDateTime.now().withMinute(0).withSecond(0).withNano(0);

        for (Movie movie : movies) {
            for (Theater theater : theaters) {
                // Let's match by city logic to make it realistic
                boolean shouldAddShows = false;
                if (movie.getTitle().contains("Avengers") || movie.getTitle().contains("Dark Knight") || movie.getTitle().contains("Avatar") || movie.getTitle().contains("Spider-Man") || movie.getTitle().contains("Jawan") || movie.getTitle().contains("Dangal")) {
                    shouldAddShows = true; // Blockbusters everywhere
                } else if (theater.getCity().equals("Mumbai") && (movie.getTitle().contains("Inception") || movie.getTitle().contains("La La Land") || movie.getTitle().contains("Parasite") || movie.getTitle().contains("3 Idiots"))) {
                    shouldAddShows = true;
                } else if (theater.getCity().equals("Delhi") && (movie.getTitle().contains("Interstellar") || movie.getTitle().contains("Matrix") || movie.getTitle().contains("Sholay"))) {
                    shouldAddShows = true;
                } else if (theater.getCity().equals("Bangalore") && (movie.getTitle().contains("Interstellar") || movie.getTitle().contains("La La Land") || movie.getTitle().contains("Matrix") || movie.getTitle().contains("Parasite") || movie.getTitle().contains("3 Idiots") || movie.getTitle().contains("Sholay"))) {
                    shouldAddShows = true;
                }

                if (shouldAddShows) {
                    showRepository.save(new Show(movie, theater, now.plusHours(10), 250.0, "Screen 1"));
                    showRepository.save(new Show(movie, theater, now.plusHours(14), 300.0, "Screen 2"));
                    showRepository.save(new Show(movie, theater, now.plusHours(18), 350.0, "IMAX Screen"));
                    showRepository.save(new Show(movie, theater, now.plusHours(22), 200.0, "Screen 1"));
                    
                    // Tomorrow shows
                    showRepository.save(new Show(movie, theater, now.plusDays(1).plusHours(10), 250.0, "Screen 1"));
                    showRepository.save(new Show(movie, theater, now.plusDays(1).plusHours(18), 350.0, "IMAX Screen"));
                }
            }
        }

        System.out.println("--- DB SEEDING COMPLETED FOR MOVIE-SERVICE ---");
    }
}
