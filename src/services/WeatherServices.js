// we are using luxon library to play with timezone efficiently

import { DateTime } from "luxon";

const API_KEY = '3a058a969c0e3b545ad6f48cbe30c59a';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

const getweatherdata=(infoType,searchparam)=>{
    const url = new URL(BASE_URL + infoType);
    url.search = new URLSearchParams({ ...searchparam,appid: API_KEY })

    return fetch(url)
    .then((res)=> res.json())
    // .then((data)=> data) ; 
};


// converting image code fetched from api into url 
const iconurlfromcode =(icon)=> `https://openweathermap.org/img/wn/${icon}@2x.png`

const formattolocaltime=(secs,offset,format="cccc, dd LLL yyyy' | Local time: 'hh:mm a")=>DateTime.fromSeconds(secs+offset, {zone: "utc"}).toFormat(format);


const formatcurrent = (data)=>{
    const {coord:{lat,lon},
main:{temp,feels_like,temp_min,temp_max,humidity},
name,
dt,
sys:{country,sunrise,sunset},
weather,
wind: {speed},
timezone,
} = data

const {main:details,icon} = weather[0];
const formattedLocaltime = formattolocaltime(dt,timezone);

return {
    temp,feels_like,temp_max,temp_min,humidity,country,name,
    sunrise: formattolocaltime(sunrise,timezone, 'hh:mm a'),
    sunset: formattolocaltime(sunset,timezone, 'hh:mm a'),
    speed,
    details,
    icon: iconurlfromcode(icon),
    formattedLocaltime,
    dt,timezone,lat,lon
}
};

const formatforecastweather = (secs,offset,data)=>{
    //hourly 
    const hourly = data.filter(f=> f.dt>secs).slice(0,5).map((f)=>({
        temp:f.main.temp,
        title: formattolocaltime(f.dt, offset,"hh:mm a"),
        icon: iconurlfromcode(f.weather[0].icon),
        date: f.dt_txt ,
    }));

    //daily 
    const daily =data.filter((f)=> f.dt_txt.slice(-8)==="00:00:00").map((f)=>({
        temp:f.main.temp,
        title: formattolocaltime(f.dt, offset,"ccc"),
        icon: iconurlfromcode(f.weather[0].icon),
        date: f.dt_txt ,
    }))
    return {hourly,daily}
}

const getformattedweatherdata = async (searchparam)=>{
    const formattedcurrentweather = await getweatherdata('weather',searchparam).then(formatcurrent);

    const{dt,lat,lon,timezone}=formattedcurrentweather

    const formattedforecastweather = await getweatherdata('forecast',{lat,lon,units:searchparam.units})
    .then((d)=> formatforecastweather(dt,timezone,d.list))
    return { ...formattedcurrentweather, ...formattedforecastweather};
};

export default getformattedweatherdata ;