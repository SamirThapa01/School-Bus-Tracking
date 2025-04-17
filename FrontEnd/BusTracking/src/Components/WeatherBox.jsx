import React, { useState, useEffect } from "react";
import axios from "axios";

const WeatherBox = ({ city }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    if (city) {
      setLoading(true);
      try {
        const apiKey = "f1e85ecd8404cd2a160aaf18a03bb05b"; 
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        setWeather(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch weather data");
        console.error("Error fetching weather data", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchWeather();
    const intervalId = setInterval(() => {
      fetchWeather();
    }, 3600000); 

    return () => clearInterval(intervalId); 
  }, [city]);

  if (loading) {
    return <div className="weather-widget">Loading...</div>;
  }

  if (error) {
    return <div className="weather-widget">{error}</div>;
  }

  if (!weather) {
    return <div className="weather-widget">No weather data available.</div>;
  }

  const { main, weather: weatherDetails } = weather;
  const temperature = main?.temp;
  const description = weatherDetails[0]?.description;
  const iconCode = weatherDetails[0]?.icon;
  const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

  return (
    <div className="weather-widget">
      <div className="weather-icon-container">
        <img src={iconUrl} alt={description} className="weather-icon" />
      </div>
      <div className="weather-info">
        <div className="weather-city">{city}</div>
        <div className="weather-temp">{temperature}°C</div>
        <div className="weather-desc">{description}</div>
      </div>
    </div>
  );
};

export default WeatherBox;
