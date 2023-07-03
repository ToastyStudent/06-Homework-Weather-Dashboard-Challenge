// Global Variables
var searchHistory = [];
var weatherApiRootUrl = 'https://api.openweathermap.org';
var weatherApiKey = '6e89671153daf4196c3a65e68cba5483';

// Variables referencing DOM elements
var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var todayContainer = document.querySelector('#today');
var forecastContainer = document.querySelector('#forecast');
var historyContainer = document.querySelector('#history');

// Adding timezone plugins to day.js
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

// This Function displays a list comprised of the user's search history.
function displaySearchHistory() {
  // First sets the innerHTML of the historyContainer to an empty string.
  historyContainer.innerHTML = '';

  // A for loop beginning at end of history array that proceeds in descending order in order 
  // to show the most recent search result at the top of the container.
  for (var i = searchHistory.length - 1; i >= 0; i--) {
    var historyBtn = document.createElement('button');
    historyBtn.setAttribute('type', 'button');
    historyBtn.setAttribute('aria-controls', 'today forecast');
    historyBtn.classList.add('history-btn', 'btn-history');

    // `data-search` allows access to city name when click handler is invoked
    historyBtn.setAttribute('data-search', searchHistory[i]);
    historyBtn.textContent = searchHistory[i];
    historyContainer.append(historyBtn);
  }
}

// A Function which update the search history saved in local storage
// Before updating the displayed search history.
function appendSearchToHistory(search) {
  // A condtional statement for the situation in which there is no search term, 
  // resulting in the function being returned.
  if (searchHistory.indexOf(search) !== -1) {
    return;
  }
  searchHistory.push(search);

  localStorage.setItem('search-history', JSON.stringify(searchHistory));
  displaySearchHistory();
}

// Function to fetch search history from local storage
function initiateSearchHistory() {
  var savedHistory = localStorage.getItem('search-history');
  if (savedHistory) {
    searchHistory = JSON.parse(savedHistory);
  }
  displaySearchHistory();
}

// This Function displays the current weather data fetched from OpenWeather api, necessitating the creation 
// of a large quantity of variables to store said data.
function renderCurrentWeather(city, weather) {
  // JQuery is used to display the Date in the format of M/D/YYYY
  var todaysDate = dayjs().format('M/D/YYYY');
  // Store response data from our fetch request in variables
  var tempFahrenheit = weather.main.temp;
  var windSpeed = weather.wind.speed;
  var humidityLevel = weather.main.humidity;
  var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  var iconDescription = weather.weather[0].description || weather[0].main;

  var weatherCard = document.createElement('div');
  var weatherCardBody = document.createElement('div');
  var cardHeading = document.createElement('h2');
  var weatherIcon = document.createElement('img');
  var tempElement = document.createElement('p');
  var windElement = document.createElement('p');
  var humidityElement = document.createElement('p');

  weatherCard.setAttribute('class', 'card');
  weatherCardBody.setAttribute('class', 'card-body');
  weatherCard.append(weatherCardBody);

  cardHeading.setAttribute('class', 'h3 card-title');
  tempElement.setAttribute('class', 'card-text');
  windElement.setAttribute('class', 'card-text');
  humidityElement.setAttribute('class', 'card-text');

  cardHeading.textContent = `${city} (${todaysDate})`;
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  cardHeading.append(weatherIcon);
  tempElement.textContent = `Temp: ${tempFahrenheit}°F`;
  windElement.textContent = `Wind: ${windSpeed} MPH`;
  humidityElement.textContent = `Humidity: ${humidityLevel} %`;
  weatherCardBody.append(cardHeading, tempElement, windElement, humidityElement);

  todayContainer.innerHTML = '';
  todayContainer.append(weatherCard);
}

// This Function, similar to the above one, displays a card containing weather data from the open weather api
// albeit for future dates rather than the current one in the form of a 5 day forecast.
function renderForecastCard(forecast) {
  // Variables to store data from the api fetch request.
  var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  var iconDescription = forecast.weather[0].description;
  var tempFahrenheit = forecast.main.temp;
  var humidityLevel = forecast.main.humidity;
  var windSpeed = forecast.wind.speed;

  // Create elements for a card
  var forecastContainer = document.createElement('div');
  var weatherCard = document.createElement('div');
  var weatherCardBody = document.createElement('div');
  var weatherCardTitle = document.createElement('h5');
  var weatherIcon = document.createElement('img');
  var tempElement = document.createElement('p');
  var windElement = document.createElement('p');
  var humidityElement = document.createElement('p');

  forecastContainer.append(weatherCard);
  weatherCard.append(weatherCardBody);
  weatherCardBody.append(weatherCardTitle, weatherIcon, tempElement, windElement, humidityElement);

  forecastContainer.setAttribute('class', 'col-md');
  forecastContainer.classList.add('five-day-card');
  weatherCard.setAttribute('class', 'card bg-primary h-100 text-white');
  weatherCardBody.setAttribute('class', 'card-body p-2');
  weatherCardTitle.setAttribute('class', 'card-title');
  tempElement.setAttribute('class', 'card-text');
  windElement.setAttribute('class', 'card-text');
  humidityElement.setAttribute('class', 'card-text');

  // Add content to the created elements via textContent and setAttribute
  weatherCardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);
  tempElement.textContent = `Temp: ${tempFahrenheit} °F`;
  windElement.textContent = `Wind: ${windSpeed} MPH`;
  humidityElement.textContent = `Humidity: ${humidityLevel} %`;

  forecastContainer.append(forecastContainer);
}

// Function to display 5 day forecast out from the current day.
function renderForecast(dailyForecast) {
  // Create unix timestamps for start and end of 5 day forecast using JQuery's dayjs library.
  var startDate = dayjs().add(1, 'day').startOf('day').unix();
  var endDate = dayjs().add(6, 'day').startOf('day').unix();

  var cardHeadingForecast = document.createElement('div');
  var cardHeading = document.createElement('h4');

  cardHeadingForecast.setAttribute('class', 'col-12');
  cardHeading.textContent = '5-Day Forecast:';
  cardHeadingForecast.append(cardHeading);

  forecastContainer.innerHTML = '';
  forecastContainer.append(cardHeadingForecast);

  for (var i = 0; i < dailyForecast.length; i++) {

    // A condititional statement mean to first filter through all of the data fetched from the api
    // and return only data that falls between 1 to 5 days after the current date.
    if (dailyForecast[i].dt >= startDate && dailyForecast[i].dt < endDate) {

      // It then filters through the data and returns only data captured at 12 pm for each day.
      if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
        renderForecastCard(dailyForecast[i]);
      }
    }
  }
}

function renderItems(city, data) {
  renderCurrentWeather(city, data.list[0], data.city.timezone);
  renderForecast(data.list);
}

// This function fetches weather data for a SPECIFIC location from the Weather Geolocation
// endpoint before calling the various established functions to display the location's current and forecast weather data.
function fetchWeather(location) {
  var { latitude } = location;
  var { longitude } = location;
  var city = location.name;

  var apiUrl = `${weatherApiRootUrl}/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      renderItems(city, data);
    })
    .catch(function (err) {
      console.error(err);
    });
}

function fetchCoordinates(search) {
  var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert('Location not found');
      } else {
        appendSearchToHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

function handleSearchFormSubmit(e) {
  // This conditional statement prevents the search form from submitting if the search input is empty.
  if (!searchInput.value) {
    return;
  }

  e.preventDefault();
  var search = searchInput.value.trim();
  fetchCoordinates(search);
  searchInput.value = '';
}

function handleSearchHistoryClick(e) {
  // This conditional statement prevents the search history buttons from working if they are not clicked.
  if (!e.target.matches('.btn-history')) {
    return;
  }

  var button = e.target;
  var search = button.getAttribute('data-search');
  fetchCoordinates(search);
}

initiateSearchHistory();
searchForm.addEventListener('submit', handleSearchFormSubmit);
historyContainer.addEventListener('click', handleSearchHistoryClick);
