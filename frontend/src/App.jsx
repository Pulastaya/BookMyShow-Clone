import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Film, 
  MapPin, 
  Search, 
  Ticket, 
  Clock, 
  Star, 
  Calendar, 
  User, 
  Mail, 
  ChevronLeft, 
  History, 
  CheckCircle,
  Loader2,
  AlertTriangle,
  Lock,
  LogOut,
  LogIn,
  Key,
  Sparkles,
  UserCheck
} from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8080';
const MOVIE_SERVICE_URL = GATEWAY_URL;
const BOOKING_SERVICE_URL = GATEWAY_URL;
const AUTH_SERVICE_URL = GATEWAY_URL;

function App() {
  // Navigation / View State
  const [view, setView] = useState('home'); // 'home', 'movie-details', 'seat-selection', 'booking-success', 'booking-history', 'profile', 'auth'
  
  // Auth State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [authError, setAuthError] = useState(null);

  // Data State
  const [movies, setMovies] = useState([]);
  const [allShows, setAllShows] = useState([]); // Cache shows for client-side joins
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [shows, setShows] = useState([]); // Filtered shows for the selected movie
  const [selectedShow, setSelectedShow] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  // User Inputs
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerBookings, setCustomerBookings] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latestBooking, setLatestBooking] = useState(null);
  const [isServiceOffline, setIsServiceOffline] = useState(false);
  const [notification, setNotification] = useState(null);

  // Seat Configuration
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsPerRow = 10;

  // Restore session on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Show notification helpers
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Initial Data Load
  useEffect(() => {
    fetchMovies();
    fetchAllShows();
  }, [selectedCity]);

  // Auto-fetch bookings when switching to history page
  useEffect(() => {
    if (view === 'booking-history') {
      const emailToUse = user ? user.email : searchEmail;
      if (emailToUse && emailToUse.trim()) {
        fetchCustomerBookings(emailToUse.trim());
      }
    }
  }, [view, user]);

  // Sync bookingName and bookingEmail with authenticated user, if available
  useEffect(() => {
    if (user) {
      setBookingName(user.name || '');
      setBookingEmail(user.email || '');
    } else {
      setBookingName('');
      setBookingEmail('');
    }
  }, [user]);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${MOVIE_SERVICE_URL}/api/movies`;
      const params = {};
      if (selectedCity && selectedCity !== 'All Cities') {
        params.city = selectedCity;
      }
      const response = await axios.get(url, { params });
      setMovies(response.data);
      setIsServiceOffline(false);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setIsServiceOffline(true);
      setError("Unable to connect to Gateway or Services. Please check if your docker containers/microservices are running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllShows = async () => {
    try {
      const response = await axios.get(`${MOVIE_SERVICE_URL}/api/shows`);
      setAllShows(response.data);
    } catch (err) {
      console.error("Error fetching all shows for cache:", err);
    }
  };

  const handleMovieSelect = async (movie) => {
    setSelectedMovie(movie);
    setLoading(true);
    try {
      let url = `${MOVIE_SERVICE_URL}/api/shows?movieId=${movie.id}`;
      if (selectedCity && selectedCity !== 'All Cities') {
        url += `&city=${selectedCity}`;
      }
      const response = await axios.get(url);
      setShows(response.data);
      setView('movie-details');
    } catch (err) {
      console.error("Error fetching shows:", err);
      setError("Failed to load showtimes for the selected movie.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowSelect = async (show) => {
    setSelectedShow(show);
    setSelectedSeats([]);
    setLoading(true);
    try {
      const response = await axios.get(`${BOOKING_SERVICE_URL}/api/bookings/show/${show.id}/seats`);
      setBookedSeats(response.data);
      setView('seat-selection');
    } catch (err) {
      console.error("Error fetching booked seats:", err);
      setError("Unable to retrieve seat layout. Please ensure Booking Service is online.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      let response;
      if (authMode === 'login') {
        response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, {
          email: authForm.email.trim(),
          password: authForm.password
        });
      } else {
        response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/register`, {
          email: authForm.email.trim(),
          password: authForm.password,
          name: authForm.name.trim(),
          role: authForm.role
        });
      }

      const { token: jwtToken, email, name, role } = response.data;
      
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify({ email, name, role }));
      
      setToken(jwtToken);
      setUser({ email, name, role });
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      
      showNotification(`Welcome, ${name}! Logged in successfully.`, "success");
      setAuthForm({ name: '', email: '', password: '', role: 'USER' });
      setView('home');
    } catch (err) {
      console.error("Auth error:", err);
      if (err.response && err.response.data) {
        setAuthError(typeof err.response.data === 'string' ? err.response.data : err.response.data.error || "Authentication failed.");
      } else {
        setAuthError("Failed to connect to authentication service.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    setView('home');
    showNotification("Logged out successfully.", "success");
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (selectedSeats.length === 0) {
      return;
    }

    if (!bookingName.trim() || !bookingEmail.trim()) {
      showNotification("Please enter your name and email address to book tickets.", "warning");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const bookingPayload = {
        showId: selectedShow.id,
        customerName: bookingName.trim(),
        customerEmail: bookingEmail.trim(),
        seatNumbers: selectedSeats.join(','),
        totalSeats: selectedSeats.length,
        totalAmount: selectedSeats.length * selectedShow.ticketPrice
      };

      const response = await axios.post(`${BOOKING_SERVICE_URL}/api/bookings`, bookingPayload);
      setLatestBooking(response.data);
      setSelectedSeats([]);
      setView('booking-success');
      showNotification("Ticket booked successfully! Check your email for confirmation.", "success");
    } catch (err) {
      console.error("Error creating booking:", err);
      if (err.response && err.response.data) {
        setError(typeof err.response.data === 'string' ? err.response.data : err.response.data.error || "Booking failed.");
      } else {
        setError("Booking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerBookings = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BOOKING_SERVICE_URL}/api/bookings/customer/${email.toLowerCase()}`);
      setCustomerBookings(response.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to fetch booking history. Make sure Booking Service is running.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to format LocalDateTime to readable time
  const formatShowTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Helper to get show/movie details by showId for booking history screen
  const getShowDetailsForHistory = (showId) => {
    const show = allShows.find(s => s.id === showId);
    if (!show) return { movieTitle: `Show #${showId}`, theaterName: 'Theater Info unavailable', showTime: '' };
    return {
      movieTitle: show.movie.title,
      theaterName: show.theater.name,
      showTime: formatShowTime(show.showTime),
      price: show.ticketPrice
    };
  };

  // Filter movies client-side with search queries
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="App flex flex-col min-h-screen">
      {/* TOAST NOTIFICATION */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '12px 24px',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: notification.type === 'success' ? 'var(--success-color)' : 
                           notification.type === 'warning' ? 'var(--warning-color)' : 'var(--danger-color)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* NAVBAR */}
      <header style={{
        background: '#151720',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => { setView('home'); setError(null); }}>
            <Film size={28} color="#f84464" style={{ filter: 'drop-shadow(0 0 8px rgba(248,68,100,0.5))' }} />
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.5rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(90deg, #fff, #f84464)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>ShowTime</span>
            <span style={{
              backgroundColor: 'rgba(248, 68, 100, 0.1)',
              color: '#f84464',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginLeft: '4px',
              border: '1px solid rgba(248, 68, 100, 0.2)'
            }}>Gateway</span>
          </div>

          {/* Search bar (only on home screen) */}
          {view === 'home' && (
            <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
              <input 
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0c0d12',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '24px',
                  padding: '10px 16px 10px 40px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f84464'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '12px' }} />
            </div>
          )}

          {/* Actions: City and Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* City Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0c0d12', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <MapPin size={16} color="#f84464" />
              <select 
                value={selectedCity} 
                onChange={(e) => { setSelectedCity(e.target.value); setView('home'); }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All Cities" style={{ background: '#151720' }}>All Cities</option>
                <option value="Mumbai" style={{ background: '#151720' }}>Mumbai</option>
                <option value="Delhi" style={{ background: '#151720' }}>Delhi</option>
                <option value="Bangalore" style={{ background: '#151720' }}>Bangalore</option>
              </select>
            </div>

            {/* Bookings Link */}
            <button 
              onClick={() => { setView(view === 'booking-history' ? 'home' : 'booking-history'); setError(null); }}
              className="glass-panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              <History size={15} color="#f84464" />
              <span>Bookings</span>
            </button>


          </div>
        </div>
      </header>

      {/* OFFLINE STATUS BANNER */}
      {isServiceOffline && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderBottom: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 0', textAlign: 'center' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#f87171', fontSize: '0.9rem', fontWeight: 500 }}>
            <AlertTriangle size={18} />
            <span><strong>Microservices system offline:</strong> Check that Docker containers or Eureka, Gateway, Auth, Movie, Booking, and MySQL are running.</span>
          </div>
        </div>
      )}

      {/* ERROR MESSAGE DISPLAY */}
      {error && !isServiceOffline && (
        <div className="container" style={{ marginTop: '20px' }}>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1.5px solid rgba(239, 68, 68, 0.2)', padding: '12px 20px', borderRadius: '8px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="container" style={{ flex: 1, padding: '30px 24px 80px 24px' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: '15px' }}>
            <Loader2 size={40} className="animate-spin" color="#f84464" />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Loading ShowTime...</span>
          </div>
        )}

        {!loading && (
          <div className="animate-fade-in">
            {/* VIEW: HOME / MOVIES */}
            {view === 'home' && (
              <div>
                {/* Hero Promotion Banner */}
                <div className="glass-panel" style={{
                  padding: '40px',
                  marginBottom: '40px',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(21, 23, 32, 0.9) 0%, rgba(248, 68, 100, 0.08) 100%)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', textAlign: 'left' }}>
                    <span style={{ color: '#f84464', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Production Microservices System</span>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '12px', lineHeight: 1.2 }}>Experience Secure Movie Ticketing</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '24px' }}>
                      Redis temporary seat locking prevents double booking. RabbitMQ manages asynchronous ticket receipts instantly to your mail.
                    </p>
                    <button onClick={() => {
                      if (movies.length > 0) {
                        handleMovieSelect(movies[0]);
                      }
                    }} className="glow-button" style={{ fontSize: '0.95rem', padding: '12px 24px' }}>
                      <Ticket size={18} />
                      <span>Book Movie Now</span>
                    </button>
                  </div>
                  {/* Decorative blur elements */}
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-20%',
                    width: '350px',
                    height: '350px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(248, 68, 100, 0.25) 0%, rgba(0,0,0,0) 70%)',
                    filter: 'blur(30px)'
                  }}></div>
                </div>

                {/* Section Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Recommended Movies</h2>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Showing {filteredMovies.length} movies</span>
                </div>

                {/* Movies Grid */}
                {filteredMovies.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    <Film size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No movies found matching your criteria.</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '24px'
                  }}>
                    {filteredMovies.map(movie => (
                      <div 
                        key={movie.id} 
                        className="movie-card" 
                        onClick={() => handleMovieSelect(movie)}
                      >
                        {/* Poster */}
                        <div style={{ height: '320px', overflow: 'hidden', position: 'relative', backgroundColor: '#090a0f' }}>
                          <img 
                            src={movie.posterUrl} 
                            alt={movie.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          />
                          {/* Rating badge */}
                          <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '12px',
                            backgroundColor: 'rgba(12, 13, 18, 0.85)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#fff'
                          }}>
                            <Star size={14} fill="#f59e0b" color="#f59e0b" />
                            <span>{movie.rating ? movie.rating.toFixed(1) : 'N/A'}</span>
                          </div>
                          {/* Language badge */}
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            backgroundColor: '#f84464',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#fff'
                          }}>
                            {movie.language}
                          </div>
                        </div>

                        {/* Text details */}
                        <div style={{ padding: '16px', textAlign: 'left' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>{movie.genre}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span>{movie.language}</span>
                            <span>{movie.durationMinutes} mins</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW: MOVIE DETAILS */}
            {view === 'movie-details' && selectedMovie && (
              <div>
                {/* Back Link */}
                <button 
                  onClick={() => setView('home')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginBottom: '24px',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#f84464'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <ChevronLeft size={18} />
                  <span>Back to Movies</span>
                </button>

                {/* Movie Info Section */}
                <div className="glass-panel" style={{
                  padding: '30px',
                  display: 'flex',
                  gap: '30px',
                  flexWrap: 'wrap',
                  marginBottom: '40px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  {/* Poster */}
                  <div style={{ width: '220px', height: '320px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={selectedMovie.posterUrl} alt={selectedMovie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Info Details */}
                  <div style={{ flex: 1, textAlign: 'left', minWidth: '300px' }}>
                    <h2 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{selectedMovie.title}</h2>
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
                      {/* Rating */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.9rem', fontWeight: 600, backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>
                        <Star size={16} fill="#f59e0b" color="#f59e0b" />
                        <span>{selectedMovie.rating ? selectedMovie.rating.toFixed(1) : 'N/A'}/10</span>
                      </div>
                      {/* Language */}
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>
                        {selectedMovie.language}
                      </div>
                      {/* Duration */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>
                        <Clock size={15} />
                        <span>{selectedMovie.durationMinutes} Mins</span>
                      </div>
                      {/* Release Date */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>
                        <Calendar size={15} />
                        <span>{selectedMovie.releaseDate ? new Date(selectedMovie.releaseDate).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Genre</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{selectedMovie.genre}</span>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>About the Movie</span>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{selectedMovie.description}</p>
                    </div>
                  </div>
                </div>

                {/* Showtimes Grid */}
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, textAlign: 'left', marginBottom: '20px' }}>Select Show & Venue</h3>
                  
                  {shows.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '40px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                      <AlertTriangle size={32} color="var(--warning-color)" style={{ marginBottom: '12px' }} />
                      <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>No shows found in {selectedCity} for this movie.</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Try switching cities from the selector in the navbar to find available shows.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Grouping shows by theater */}
                      {Object.values(shows.reduce((acc, show) => {
                        if (!acc[show.theater.id]) {
                          acc[show.theater.id] = { theater: show.theater, shows: [] };
                        }
                        acc[show.theater.id].shows.push(show);
                        return acc;
                      }, {})).map(({ theater, shows: theaterShows }) => (
                        <div key={theater.id} className="glass-panel" style={{
                          padding: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '20px',
                          textAlign: 'left',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          {/* Theater details */}
                          <div style={{ flex: 1, minWidth: '250px' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{theater.name}</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{theater.address}, {theater.city}</p>
                          </div>
                          
                          {/* Show times list */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {theaterShows.map(show => (
                              <button 
                                key={show.id}
                                onClick={() => handleShowSelect(show)}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: '1px solid rgba(248, 68, 100, 0.4)',
                                  color: '#f84464',
                                  padding: '10px 16px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  fontSize: '0.85rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  transition: 'var(--transition-smooth)'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f84464';
                                  e.currentTarget.style.color = '#fff';
                                } }
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = '#f84464';
                                } }
                              >
                                <span>{formatShowTime(show.showTime)}</span>
                                <span style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>₹{show.ticketPrice.toFixed(0)} ({show.screenName})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW: SEAT SELECTION */}
            {view === 'seat-selection' && selectedShow && (
              <div>
                {/* Back Link */}
                <button 
                  onClick={() => handleMovieSelect(selectedMovie)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginBottom: '24px',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#f84464'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <ChevronLeft size={18} />
                  <span>Back to Showtimes</span>
                </button>

                {/* Show details description */}
                <div className="glass-panel" style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  marginBottom: '40px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'left'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{selectedMovie.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {selectedShow.theater.name} | {selectedShow.screenName} | {formatShowTime(selectedShow.showTime)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Ticket Price</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f84464' }}>₹{selectedShow.ticketPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Seat Selector Grid and Checkout */}
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                  {/* Grid Container */}
                  <div className="glass-panel" style={{
                    flex: 1,
                    minWidth: '320px',
                    padding: '30px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    {/* Screen Indicator */}
                    <div style={{ width: '80%', maxWidth: '400px', marginBottom: '40px', textAlign: 'center' }}>
                      <div style={{
                        height: '4px',
                        backgroundColor: '#f84464',
                        boxShadow: '0 0 10px rgba(248, 68, 100, 0.8)',
                        borderRadius: '2px',
                        marginBottom: '8px'
                      }}></div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Screen This Way</span>
                    </div>

                    {/* Seat Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
                      {rows.map(row => (
                        <div key={row} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          {/* Row Indicator */}
                          <span style={{ width: '20px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{row}</span>
                          
                          {/* Row Seats */}
                          {Array.from({ length: seatsPerRow }, (_, i) => {
                            const seatNum = `${row}${i + 1}`;
                            const isBooked = bookedSeats.includes(seatNum);
                            const isSelected = selectedSeats.includes(seatNum);
                            
                            let seatClass = 'available';
                            if (isBooked) seatClass = 'booked';
                            else if (isSelected) seatClass = 'selected';
                            
                            return (
                              <div 
                                key={seatNum}
                                className={`seat ${seatClass}`}
                                onClick={() => handleSeatClick(seatNum)}
                              >
                                {i + 1}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="seat available" style={{ cursor: 'default' }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Available</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="seat selected" style={{ cursor: 'default' }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Selected</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="seat booked" style={{ cursor: 'default' }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Booked</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking form checkout sidebar */}
                  <div className="glass-panel" style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '30px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'left',
                    height: 'fit-content'
                  }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>Booking Summary</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyBytes: 'space-between', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Seats:</span>
                        <span style={{ fontWeight: 600, color: '#fff' }}>
                          {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ticket Count:</span>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{selectedSeats.length}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                        <span style={{ color: '#fff', fontWeight: 600 }}>Total Price:</span>
                        <span style={{ fontWeight: 800, color: '#f84464', fontSize: '1.3rem' }}>
                          ₹{(selectedSeats.length * selectedShow.ticketPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Booking Form displaying user identity details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Customer Information</span>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Full Name</label>
                        <input
                          type="text"
                          placeholder="Enter your name"
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            fontSize: '0.85rem',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Email Address</label>
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={bookingEmail}
                          onChange={(e) => setBookingEmail(e.target.value)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            fontSize: '0.85rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleBookingSubmit} 
                      disabled={selectedSeats.length === 0 || loading}
                      className="glow-button"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        marginTop: '20px',
                        padding: '12px'
                      }}
                    >
                      <CheckCircle size={18} />
                      <span>Confirm and Pay</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: AUTHENTICATION (LOGIN / SIGNUP) */}
            {view === 'auth' && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="glass-panel" style={{
                  width: '100%',
                  maxWidth: '420px',
                  padding: '40px 30px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'left',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(248, 68, 100, 0.1)', color: '#f84464', marginBottom: '16px' }}>
                      <Lock size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>
                      {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {authMode === 'login' ? 'Sign in to purchase tickets and view history' : 'Register to start reserving seats instantly'}
                    </p>
                  </div>

                  {authError && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 16px', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} />
                      <span>{authError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {authMode === 'signup' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="text" 
                            required 
                            placeholder="Enter your name" 
                            value={authForm.name}
                            onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                            style={{
                              width: '100%',
                              backgroundColor: '#0c0d12',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              padding: '10px 12px 10px 36px',
                              color: '#fff',
                              outline: 'none',
                              fontSize: '0.9rem'
                            }}
                          />
                          <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="email" 
                          required 
                          placeholder="Enter your email" 
                          value={authForm.email}
                          onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                          style={{
                            width: '100%',
                            backgroundColor: '#0c0d12',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '10px 12px 10px 36px',
                            color: '#fff',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                        />
                        <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Password</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="password" 
                          required 
                          placeholder="Enter your password" 
                          value={authForm.password}
                          onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                          style={{
                            width: '100%',
                            backgroundColor: '#0c0d12',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '10px 12px 10px 36px',
                            color: '#fff',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                        />
                        <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                      </div>
                    </div>

                    {authMode === 'signup' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Account Type (Role)</label>
                        <select 
                          value={authForm.role}
                          onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                          style={{
                            width: '100%',
                            backgroundColor: '#0c0d12',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            color: '#fff',
                            outline: 'none',
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="USER">Standard User (Customer)</option>
                          <option value="ADMIN">Administrator</option>
                        </select>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="glow-button"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        marginTop: '10px',
                        padding: '12px'
                      }}
                    >
                      <Sparkles size={18} />
                      <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    </button>
                  </form>

                  <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                    <button 
                      onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(null); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-color)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    >
                      {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: USER PROFILE PAGE */}
            {view === 'profile' && user && (
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'left', marginBottom: '8px' }}>User Profile</h2>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'left', marginBottom: '24px' }}>
                  Manage your account details and security settings.
                </p>

                <div className="glass-panel" style={{
                  padding: '30px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'left',
                  marginBottom: '30px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(248, 68, 100, 0.1)', color: '#f84464' }}>
                      <User size={30} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>{user.name}</h3>
                      <span style={{
                        backgroundColor: user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: user.role === 'ADMIN' ? 'var(--danger-color)' : 'var(--success-color)',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        display: 'inline-block',
                        marginTop: '4px',
                        border: user.role === 'ADMIN' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                      }}>{user.role}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Email Address</span>
                      <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 500 }}>{user.email}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Account Status</span>
                      <span style={{ fontSize: '1rem', color: 'var(--success-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={16} /> Active & Secured with JWT
                      </span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Registered Bookings</span>
                      <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 500 }}>{customerBookings.length} completed reservations</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <button onClick={() => setView('booking-history')} className="glow-button" style={{ flex: 1, justifyContent: 'center' }}>
                    <History size={18} />
                    <span>View Booking History</span>
                  </button>
                  <button onClick={handleLogout} className="glass-panel" style={{ flex: 1, color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.05)', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px' }}>
                    <LogOut size={18} />
                    <span>Logout Account</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW: BOOKING SUCCESS (CONFIRMED TICKET) */}
            {view === 'booking-success' && latestBooking && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                  <CheckCircle size={60} color="var(--success-color)" style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.4))', marginBottom: '16px' }} />
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Booking Confirmed!</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Show this ticket at the theater entry gate.</p>
                </div>

                {/* Styled Ticket */}
                <div className="glass-panel" style={{
                  width: '100%',
                  position: 'relative',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'linear-gradient(180deg, #181a24 0%, #111219 100%)',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.5)'
                }}>
                  {/* Header */}
                  <div style={{
                    backgroundColor: '#f84464',
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#fff'
                  }}>
                    <span style={{ fontWeight: 800, letterSpacing: '1px', fontSize: '0.85rem', textTransform: 'uppercase' }}>ShowTime Ticket</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>CONFIRMED</span>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '24px', textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '16px' }}>{selectedMovie.title}</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Venue</span>
                        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{selectedShow.theater.name}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Screen</span>
                        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{selectedShow.screenName}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Date & Time</span>
                        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{formatShowTime(selectedShow.showTime)}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Seats Booked</span>
                        <span style={{ color: '#f84464', fontSize: '0.95rem', fontWeight: 700 }}>{latestBooking.seatNumbers}</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '20px' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Customer Name</span>
                        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>{latestBooking.customerName}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Booking ID</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>#BMS-{latestBooking.id}-{Math.floor(1000 + Math.random() * 9000)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cut-out circles on ticket sides */}
                  <div style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', left: '-10px', bottom: '80px', borderRight: '1.5px solid rgba(255,255,255,0.1)' }}></div>
                  <div style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', right: '-10px', bottom: '80px', borderLeft: '1.5px solid rgba(255,255,255,0.1)' }}></div>

                  {/* Ticket Footer / Barcode */}
                  <div style={{
                    borderTop: '1.5px dashed rgba(255,255,255,0.1)',
                    padding: '24px',
                    backgroundColor: '#111219',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    {/* Simulated Barcode */}
                    <div style={{
                      width: '100%',
                      height: '45px',
                      background: 'repeating-linear-gradient(90deg, #fff, #fff 2px, #000 2px, #000 6px, #fff 6px, #fff 10px)',
                      opacity: 0.85,
                      marginBottom: '8px'
                    }}></div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '2px', fontFamily: 'monospace' }}>TOTAL PAID: ₹{latestBooking.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setView('home')} 
                  className="glow-button" 
                  style={{ marginTop: '30px', padding: '12px 24px' }}
                >
                  <Film size={18} />
                  <span>Back to Home</span>
                </button>
              </div>
            )}

            {/* VIEW: BOOKING HISTORY */}
            {view === 'booking-history' && (
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'left', marginBottom: '8px' }}>Booking History</h2>
                
                <div className="glass-panel" style={{ padding: '20px', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Search Bookings by Email</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="email"
                      placeholder="Enter your email address to search tickets"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={() => {
                        if (searchEmail.trim()) {
                          fetchCustomerBookings(searchEmail.trim());
                        } else {
                          showNotification("Please enter an email address.", "warning");
                        }
                      }}
                      className="glow-button"
                      style={{ padding: '0 20px', borderRadius: '6px' }}
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Booking History Results */}
                {customerBookings.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    <Ticket size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No bookings found for this account yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {customerBookings.map(booking => {
                      const details = getShowDetailsForHistory(booking.showId);
                      return (
                        <div key={booking.id} className="glass-panel" style={{
                          padding: '24px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '20px',
                          textAlign: 'left',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          {/* Booking Summary */}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <span style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                color: 'var(--success-color)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                              }}>{booking.status}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ID: #BMS-{booking.id}</span>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{details.movieTitle}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2px' }}>{details.theaterName} | {details.showTime}</p>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Booked on: {new Date(booking.bookingTime).toLocaleString()}</span>
                          </div>

                          {/* Ticket Seats & Price */}
                          <div style={{ textAlign: 'right', minWidth: '150px' }}>
                            <div style={{ marginBottom: '8px' }}>
                              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Seats</span>
                              <span style={{ color: '#f84464', fontSize: '1.1rem', fontWeight: 700 }}>{booking.seatNumbers}</span>
                            </div>
                            <div>
                              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Amount Paid</span>
                              <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>₹{booking.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: '#090a0f',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 0',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <span>© 2026 ShowTime Clone. Built with React.js, Gateway, Spring Boot microservices, Redis, RabbitMQ & MySQL.</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
