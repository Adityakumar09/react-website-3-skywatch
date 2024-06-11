import React, { useEffect, useState } from 'react'
import TopButtons from './components/TopButtons'
import Inputs from './components/Inputs'
import TimeLocation from './components/TimeLocation'
import TempAndDetails from './components/TempAndDetails'
import Forecast from './components/Forecast'
import getformattedweatherdata from './services/WeatherServices'
import { ToastContainer,toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function capitalizefirstletter(string){
  return string.charAt(0).toUpperCase()+string.slice(1);
}

const App = () => {

  const [query,setQuery] = useState({q:'ahmedabad'})
  const [units,setUnits] = useState('metric')
  const [weather,setWeather] = useState(null)

  const getWeather = async () => {

    const message = query.q ? query.q : "current location";
    toast.info(`Fetching weather data for ${capitalizefirstletter(message)}`)

    await getformattedweatherdata({...query,units}).then((data)=>{
      toast.success(`Fetched weather data for ${data.name},${data.country}  `)
      setWeather(data);
    });
    // console.log(weather)
  };

  useEffect(()=>{
    getWeather();
  },[query,units])

  const formatbg= ()=>{
    if (!weather) return 'from-cyan-600 to-blue-700' ;
    const threshold = units === "metric" ?20 :60 ;
    if (weather.temp <= threshold) return "from-cyan-600 to-blue-700";
    return "from-yellow-600 to-orange-700"
  }
  
  return (
    <div className={`mx-auto max-w-screen-lg mt-4 py-5 px-32 bg-gradient-to-br shadow-xl shadow-gray-400 ${formatbg()}`}>
      <TopButtons setQuery={setQuery} />
      <Inputs setQuery={setQuery} setUnits={setUnits} />
      {weather && (
        <>
        <TimeLocation weather={weather} />
        <TempAndDetails weather={weather} units={units} />
        <Forecast title='3 hour step forecast' data={weather.hourly} />
        <Forecast title='daily forecast' data={weather.daily} />
        </>
      )}

      <ToastContainer autoClose={2500} hideProgressBar={true} theme='colored' />
      
    </div>
  )
}

export default App