class WeatherApp {
    constructor() {
        this.apiKey = '840b43d55a0644ea86e162321250708';
        this.baseURL = 'https://api.weatherapi.com/v1';
        this.isCelsius = true;
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.getCurrentLocationWeather();
    }

    setupEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const locationInput = document.getElementById('locationInput');
        const unitToggle = document.getElementById('unitToggle');

        searchBtn.addEventListener('click', () => this.searchLocation());
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchLocation();
        });
        unitToggle.addEventListener('click', () => this.toggleUnits());
    }

    async getCurrentLocationWeather() {
        try {
            const position = await this.getCurrentPosition();
            const { latitude, longitude } = position.coords;
            await this.fetchWeatherData(`${latitude},${longitude}`);
        } catch (error) {
            console.error('Error getting location:', error);
            await this.fetchWeatherData('New Delhi'); // Fallback to user's location
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }

    async fetchWeatherData(location) {
        try {
            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(`${this.baseURL}/current.json?key=${this.apiKey}&q=${location}&aqi=yes`),
                fetch(`${this.baseURL}/forecast.json?key=${this.apiKey}&q=${location}&days=5&aqi=yes&alerts=yes`)
            ]);

            if (!currentResponse.ok || !forecastResponse.ok) {
                throw new Error('Weather data not found');
            }

            const currentData = await currentResponse.json();
            const forecastData = await forecastResponse.json();

            this.updateCurrentWeather(currentData);
            this.updateForecast(forecastData);
            this.updateHourlyForecast(forecastData);

        } catch (error) {
            console.error('Error fetching weather data:', error);
            this.showError('Unable to fetch weather data. Please try again.');
        }
    }

    updateCurrentWeather(data) {
        const location = data.location;
        const current = data.current;

        document.getElementById('currentLocation').textContent = 
            `${location.name}, ${location.country}`;
        
        document.getElementById('currentTemp').textContent = 
            `${Math.round(this.isCelsius ? current.temp_c : current.temp_f)}°`;
        
        document.getElementById('weatherDescription').textContent = current.condition.text;
        document.getElementById('weatherIcon').src = `https:${current.condition.icon}`;
        document.getElementById('weatherIcon').alt = current.condition.text;
        
        document.getElementById('feelsLike').textContent = 
            `Feels like ${Math.round(this.isCelsius ? current.feelslike_c : current.feelslike_f)}°`;
        
        document.getElementById('humidity').textContent = `Humidity: ${current.humidity}%`;
        document.getElementById('windSpeed').textContent = `Wind: ${current.wind_kph} km/h`;
    }

    updateForecast(data) {
        const forecastGrid = document.getElementById('forecastGrid');
        forecastGrid.innerHTML = '';

        data.forecast.forecastday.forEach(day => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card';
            
            forecastCard.innerHTML = `
                <h4>${dayName}</h4>
                <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" />
                <p class="temp-range">
                    ${Math.round(this.isCelsius ? day.day.maxtemp_c : day.day.maxtemp_f)}° / 
                    ${Math.round(this.isCelsius ? day.day.mintemp_c : day.day.mintemp_f)}°
                </p>
                <p class="condition">${day.day.condition.text}</p>
                <small>💧 ${day.day.daily_chance_of_rain}%</small>
            `;
            
            forecastGrid.appendChild(forecastCard);
        });
    }

    updateHourlyForecast(data) {
        const hourlyGrid = document.getElementById('hourlyGrid');
        hourlyGrid.innerHTML = '';

        const todayHours = data.forecast.forecastday[0].hour;
        const currentHour = new Date().getHours();

        // Show next 12 hours
        for (let i = 0; i < 12; i++) {
            const hourIndex = (currentHour + i) % 24;
            const hourData = todayHours[hourIndex];
            
            const hourlyCard = document.createElement('div');
            hourlyCard.className = 'hourly-card';
            
            const time = new Date(hourData.time).toLocaleTimeString('en-US', {
                hour: 'numeric',
                hour12: true
            });
            
            hourlyCard.innerHTML = `
                <p>${time}</p>
                <img src="https:${hourData.condition.icon}" alt="${hourData.condition.text}" />
                <p>${Math.round(this.isCelsius ? hourData.temp_c : hourData.temp_f)}°</p>
                <small>${hourData.chance_of_rain}%</small>
            `;
            
            hourlyGrid.appendChild(hourlyCard);
        }
    }

    toggleUnits() {
        this.isCelsius = !this.isCelsius;
        const unitToggle = document.getElementById('unitToggle');
        unitToggle.textContent = this.isCelsius ? '°C' : '°F';
        
        // Re-fetch current weather data to update display
        const currentLocation = document.getElementById('currentLocation').textContent;
        if (currentLocation !== 'Getting location...') {
            this.searchLocation(currentLocation);
        }
    }

    searchLocation(location = null) {
        const locationInput = document.getElementById('locationInput');
        const searchLocation = location || locationInput.value.trim();
        
        if (searchLocation) {
            this.fetchWeatherData(searchLocation);
            locationInput.value = '';
        }
    }

    showError(message) {
        document.getElementById('currentLocation').textContent = message;
        document.getElementById('currentTemp').textContent = '--°';
        document.getElementById('weatherDescription').textContent = 'Unable to load weather data';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});
