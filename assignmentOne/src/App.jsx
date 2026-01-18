import './App.css'
import WeatherApp from './components/WeatherApp/WeatherApp'
import locations from '../../locations.json'

function App() {
  return (
    <div className="app">
      <h1 className="title">Weather App</h1>
      <WeatherApp locations={locations} />
    </div>
  )
}

export default App
