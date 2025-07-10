const apiKey = "YOUR-API"; // GET AN API FROM WEATHERAPI

const weatherResult = document.getElementById("weatherResult");
const getWeatherBtn = document.getElementById("getWeatherBtn");
const cityInput = document.getElementById("cityInput");

getWeatherBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (city === "") {
    weatherResult.innerHTML = `<p>Please enter a city name.</p>`;
    return;
  }

  const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=3`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then(data => {
      const temp = data.current.temp_c;
      const condition = data.current.condition.text;
      const icon = "https:" + data.current.condition.icon;
      const humidity = data.current.humidity;
      const wind = data.current.wind_kph;
      const cityName = data.location.name;
      const country = data.location.country;
      const localTime = data.location.localtime;

      // Current Weather Display
      weatherResult.innerHTML = `
        <h2>${cityName}, ${country}</h2>
        <p><strong>Local Time:</strong> ${localTime}</p>
        <img src="${icon}" alt="${condition}">
        <p><strong>Condition:</strong> ${condition}</p>
        <p><strong>Temperature:</strong> ${temp} °C</p>
        <p><strong>Humidity:</strong> ${humidity}%</p>
        <p><strong>Wind Speed:</strong> ${wind} km/h</p>
      `;

      // Forecast Display
      const forecastDays = data.forecast.forecastday;
      let forecastHTML = "<h3>3-Day Forecast</h3><div class='forecast'>";

      forecastDays.forEach(day => {
        forecastHTML += `
          <div class="forecast-day">
            <p><strong>${day.date}</strong></p>
            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            <p>${day.day.condition.text}</p>
            <p>🌡️ ${day.day.avgtemp_c} °C</p>
          </div>
        `;
      });

      forecastHTML += "</div>";

      weatherResult.innerHTML += forecastHTML;
    })
    .catch(error => {
      weatherResult.innerHTML = `<p>❌ ${error.message}</p>`;
      console.error("Error fetching weather:", error);
    });
});
