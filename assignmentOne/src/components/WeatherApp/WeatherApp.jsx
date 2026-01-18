import WeatherDisplay from '../WeatherDisplay/WeatherDisplay'
import './WeatherApp.css'

function WeatherApp({ locations }) {
    return (
        <div className="weather-app">
            {locations.map((location) => (
                <WeatherDisplay
                    key={location.city}
                    city={location.city}
                    temperature={location.temperature}
                    weather={location.weather}
                />
            ))}
        </div>
    )
}

export default WeatherApp