import './WeatherDisplay.css';

function WeatherDisplay({ city, temperature, weather }) {
    return (
        <div className="weather-display">
            <h2 className="city">{city}</h2>
            <p className="weather-info">{temperature} - {weather}</p>
        </div>
    );
}

export default WeatherDisplay;