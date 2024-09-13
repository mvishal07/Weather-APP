import React, { useState } from "react";
import axios from "axios";
import "./index.css";

const WeatherPage = ({ user }) => {
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    try {
      const response = await axios.post("/api/weather", {
        userId: user.id,
        location,
      });
      setWeatherData(response.data.weatherData);
      fetchHistory();
    } catch (error) {
      setWeatherData(null);
      setError(error.response?.data?.error || "Error fetching weather data");
    }
  };

  const fetchHistory = async () => {
    setError("");
    try {
      const response = await axios.get(`/api/history/${user.id}`);
      setHistory(response.data.history);
    } catch (error) {
      setHistory([]);
      setError(error.response?.data?.error || "Error fetching search history");
    }
  };
return(
  <div className="weather-page">
  <video autoPlay muted loop className="background-video">
    <source src="/videos/1893623-uhd_3840_2160_25fps.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  <div className="content">
    <h2>Weather Search</h2>
    <input
      type="text"
      placeholder="Location"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
    />
    <button onClick={handleSearch}>Search</button>
    {error && <p className="error-message">{error}</p>}
    {weatherData && <p>{weatherData}</p>}
    <h3>Search History</h3>
    <ul>
      {history.map((entry, index) => (
        <li key={index}>
          {entry.location}: {entry.weather_data} at{" "}
          {new Date(entry.timestamp).toLocaleString()}
        </li>
      ))}
    </ul>
  </div>
</div>
);
};

export default WeatherPage;
