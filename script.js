const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer= document.querySelector(".weather-container");
const grantAccess = document.querySelector(".grant-locationContainer");
const searchForm = document.querySelector(".form-container");
const loadingScreen =document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const weatherNotFound = document.querySelector(".not-found");

// initial variables
let currentTab= userTab;
const API_KEY= "154a1fb6afddacb217d75c37a19350fc";
currentTab.classList.add("currentTab");
getFromSessionStorage();

function switchTab(clickedTab){
    if(clickedTab != currentTab){
        currentTab.classList.remove("currentTab")
        currentTab = clickedTab;
        currentTab.classList.add("currentTab");

        // Removing Not found png whenever tab is switched
        weatherNotFound.classList.remove("active");

        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccess.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener("click", ()=>{switchTab(userTab)});
searchTab.addEventListener("click", ()=>{switchTab(searchTab)});


function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        grantAccess.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

const notFoundMsg = document.querySelector("[not-foundMsg]");
async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    // Make grant container invisible
    grantAccess.classList.remove("active");
    // Showing loading screen
    loadingScreen.classList.add("active");


    // API call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await response.json();


        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);
    }
    catch(err){
        console.log("ERROR DURING API CALL : " + err);
        loadingScreen.classList.remove("active");
        // Add 404 not found png
        weatherNotFound.classList.add("active");
        notFoundMsg.innerText = err;
    }
}

function renderWeatherInfo(weatherInfo){
    // fetching all the elements
    console.log(weatherInfo);
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const weatherDesc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[weatherIcon]");
    const temp = document.querySelector("[dataTemp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-clouds]");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    weatherDesc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = kelvinToCelsius(weatherInfo?.main?.temp) + " °C";
    windspeed.innerText= weatherInfo?.wind?.speed + " m/s";
    humidity.innerText = weatherInfo?.main?.humidity + " %";
    cloudiness.innerText = weatherInfo?.clouds?.all+ " %";

}



function kelvinToCelsius(ktemp){
    return (ktemp-273.15).toFixed(2);
}


function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert("Your device doesn't support location feature");
    }
}

function showPosition(position){

    const userCoordinates ={
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }

    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessBtn = document.querySelector("[data-grantAccess]");
grantAccessBtn.addEventListener('click', getLocation);


const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    let city = searchInput.value;

    if(city === ""){
        return;
    }
    else{
        fetchSearchWeatherInfo(city);
    }

})

async function fetchSearchWeatherInfo(city){
    weatherNotFound.classList.remove("active");
    userInfoContainer.classList.remove("active");
    grantAccess.classList.remove("active");
    loadingScreen.classList.add("active");
    
    try{
        const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
        const data = await resp.json();

        if(data?.name){
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }
        else{
            throw new Error(" Undefined City Name")
        }
    }
    catch(err){
        console.log("ERROR DURING SEARCH : " + err);
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        
        // Add 404 not found png
        weatherNotFound.classList.add("active");
        notFoundMsg.innerText = err;
    }
}