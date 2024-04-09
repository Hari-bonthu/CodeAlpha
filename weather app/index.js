const searchInput = document.getElementById('search');
const searchButton = document.getElementById('btn');
const locName = document.querySelector('.loc-name');
const tempElement = document.getElementById('temp-data');
const windElement = document.getElementById('wind-data');
const humidityElement = document.getElementById('humidity-data');
// const tempMain = document.querySelector('.temp-main');

    searchButton.addEventListener('click', getWeather);

    function getWeather() {
        const apiKey = '92623c7259c0909645d9c5f01db02936';
        const city = searchInput.value;

        if (city) {
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('City not found');
                    }
                    return response.json();
                })
                .then(data => {
                    locName.textContent = data.name;
                    // tempMain.textContent = ` ${Math.round(data.main.temp - 273.15)}°C`;

                    tempElement.textContent = `${Math.round(data.main.temp - 273.15)}°C`;
                    windElement.textContent = `${data.wind.speed} m/s`;
                    humidityElement.textContent = `${data.main.humidity}%`;
                })
                .catch(error => {
                    console.error('Error fetching weather data:', error.message);
                    alert('Error fetching weather data. Please try again.');
                });
        } else {
            alert('Please enter a city name.');
        }
    }

