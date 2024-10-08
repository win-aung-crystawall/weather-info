import {
    countryCodes
} from "./countryCodes";
import {
    tempConverter
} from "./utils";
const cityOffsets = require('timezone-name-offsets');

export const methodsVue = {
    calcTime(offset) {
        const d = new Date();
        const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        const nd = new Date(utc + (3600000 * offset));
        return { hours: nd.getHours(), minutes: nd.getMinutes(), seconds: nd.getSeconds() }
    },
    locateUserPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(res => this.getDefaultData(res));
        }
    },
    async getDefaultData(pos) {
        const res = await fetch(`https://api.weatherbit.io/v2.0/current?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${this.API_KEY}&units=${this.API_UNITS}`)
        const data = await res.json();
        this.setData(data);
        // console.log(data);
    },
    async getSearchedData(e) {
        if (e.target.firstChild.value) {
            this.infoTexts = false;
            this.detailDataTexts = false;
            this.alertTitleText = false;
            this.multipleAlertsTitleText = false;
            this.loading = true;
            const res = await fetch(this.filterCity(e.target.firstChild.value));
            if (res.status === 200) {
                const data = await res.json();
                this.setData(data);
            } else {
                this.showNotFound(e);
            }
        }
    },
    filterCity(city) {
        return city === 'los angeles' ||
            city === 'Los Angeles' ||
            city === 'los Angeles' ||
            city === 'Los angeles' ||
            city === 'LOS ANGELES' ? `https://api.weatherbit.io/v2.0/current?city_id=5344994&key=${this.API_KEY}`
            : `https://api.weatherbit.io/v2.0/current?city=${city}&key=${this.API_KEY}`;
    },
    setData(data) {
        this.detailDataTexts = true;
        this.loading = false;
        this.infoTexts = true;

        // if (window.innerWidth >= 768) {
        //     this.setBg(data.data[0].weather.code, data.data[0].pod);
        // }

        this.setBg(data.data[0].weather.code, data.data[0].pod);

        data.data[0].pod === 'd' ? this.details.iconId = `owf-${data.data[0].weather.code}-d`
            : this.details.iconId = `owf-${data.data[0].weather.code}-n`;

        data.data[0].country_code === 'US' ? this.details.stateCode = `${data.data[0].state_code}, `
            : this.details.stateCode = '';

        data.data[0].aqi !== null ? this.details.aqi = data.data[0].aqi
            : this.details.aqi = 'N/A';

        this.details.city = data.data[0].city_name;
        this.details.country = countryCodes.find(i => i.Code === data.data[0].country_code).Name;
        this.details.condition = data.data[0].weather.description;
        this.details.mainTemp = `${Math.round(data.data[0].temp)}℃`;
        this.details.feelsLikeTemp = `${Math.round(data.data[0].app_temp)}℃`;
        this.details.clouds = `${data.data[0].clouds}%`;
        this.details.humidity = `${Math.round(data.data[0].rh)}%`;
        this.details.pressure = `${Math.round(data.data[0].pres)}mb`;
        this.details.dewPoint = `${Math.round(data.data[0].dewpt)}℃`;
        this.details.uvi = Math.round(data.data[0].uv);
        this.details.visibility = `${Math.round(data.data[0].vis)}km`;
        this.details.slp = 'N/A'
        this.details.windSpeed = `${data.data[0].wind_spd.toFixed(1)}m/s`
        this.details.windDir = data.data[0].wind_cdir;
        this.windDegree = `${data.data[0].wind_dir}`;

        this.setAQIColor(data.data[0].aqi);
        this.setWindmillSpeed(data.data[0].wind_spd);
        this.getAlerts(data.data[0].city_name);
        this.setTime(data);
    },
    setTime(data) {
        if (cityOffsets[data.data[0].timezone] != undefined) {
            let now = this.calcTime(cityOffsets[data.data[0].timezone] / 60)
            this.time = `${now.hours.toString().length === 1 ? `0${now.hours}` :
                now.hours}:${now.minutes.toString().length === 1 ? `0${now.minutes}` : now.minutes}`;
        } else {
            let s = new Date();
            this.time = `${s.getHours()}:${s.getMinutes().toString().length === 1 ? `0${s.getMinutes()}` : s.getMinutes()}`;
        }
        //
        // console.log(data)
        console.log(cityOffsets[data.data[0].timezone])
        // console.log(cityOffsets)
        // if (data.data[0].timezone === "")

    },
    async getAlerts(cityName) {
        const res = await fetch(`https://api.weatherbit.io/v2.0/alerts?city=${cityName}&key=${this.API_KEY}`);
        const data = await res.json();
        if (data.alerts.length > 1) {
            this.setMultipleAlerts(data);
        } else if (!(data.alerts.length === 0)) {
            this.setAlert(data);
        } else {
            this.alertTitleText = false;
        }
    },
    setAlert(data) {
        this.alertTitleText = true;
        this.alertTitle = data.alerts[0].title;
        this.alertBody = data.alerts[0].description;
        this.alertRegions = data.alerts[0].regions.toString();
    },
    setMultipleAlerts(data) {
        this.multipleAlertsTitleText = true;
        this.multipleAlertsTitle = `${data.alerts.length} Weather Alerts in this area`;
        this.multipleAlertsArray = data.alerts;
    },
    setBg(weatherCode, pod) {
        if (pod === 'd') {
            weatherCode >= 200 && weatherCode <= 531 ? this.bgImage = 'rain-d' :
                weatherCode === 701 || weatherCode === 711 || weatherCode === 721 || weatherCode === 741 ? this.bgImage = 'foggy-d' :
                    weatherCode >= 600 && weatherCode <= 622 ? this.bgImage = 'snow-d' :
                        weatherCode >= 803 && weatherCode <= 804 ? this.bgImage = 'cloudy-d' :
                            this.bgImage = 'clear-d';
        } else {
            weatherCode >= 200 && weatherCode <= 531 ? this.bgImage = 'rain-n' :
                weatherCode === 701 || weatherCode === 711 || weatherCode === 721 || weatherCode === 741 ? this.bgImage = 'foggy-d' :
                    weatherCode >= 600 && weatherCode <= 622 ? this.bgImage = 'snow-n' :
                        weatherCode >= 803 && weatherCode <= 804 ? this.bgImage = 'cloudy-n' :
                            this.bgImage = 'clear-n';
        }
    },
    setAQIColor(aqi) {
        aqi === null ? this.aqiColor = '' :
            aqi > 0 && aqi <= 50 ? this.aqiColor = 'aqi-green' :
                aqi > 50 && aqi <= 100 ? this.aqiColor = 'aqi-yellow' :
                    aqi > 100 && aqi <= 150 ? this.aqiColor = 'aqi-orange' :
                        aqi > 150 && aqi <= 200 ? this.aqiColor = 'aqi-red' :
                            aqi > 200 && aqi <= 300 ? this.aqiColor = 'aqi-purple' :
                                this.aqiColor = 'aqi-brown';
    },
    setWindmillSpeed(speedMph) {
        let speed = Math.round(speedMph * 2.237);
        speed < 1 ? this.pinmillSpeed = '0s' :
            speed >= 1 && speed <= 3 ? this.windmillSpeed = '5s' :
                speed >= 4 && speed <= 7 ? this.windmillSpeed = '3s' :
                    speed >= 8 && speed <= 12 ? this.windmillSpeed = '2s' :
                        speed >= 13 && speed <= 18 ? this.windmillSpeed = '1s' :
                            speed >= 19 && speed <= 24 ? this.windmillSpeed = '0.8s' :
                                speed >= 25 && speed <= 31 ? this.windmillSpeed = '0.5s' :
                                    this.windmillSpeed = '0.3s';
    },
    changeUnits() {
        if (this.details.mainTemp.slice(-1) === '℃') {
            this.details.mainTemp = `${tempConverter.CtoF(this.details.mainTemp.split('℃')[0])}℉`;
            this.details.feelsLikeTemp = `${tempConverter.CtoF(this.details.feelsLikeTemp.split('℃')[0])}℉`;
            this.details.dewPoint = `${tempConverter.CtoF(this.details.dewPoint.split('℃')[0])}℉`;
            this.details.windSpeed = `${(this.details.windSpeed.split('m/s')[0] * 2.237).toFixed(1)}mph`
        } else {
            this.details.mainTemp = `${tempConverter.FtoC(this.details.mainTemp.split('℉')[0])}℃`;
            this.details.feelsLikeTemp = `${tempConverter.FtoC(this.details.feelsLikeTemp.split('℉')[0])}℃`;
            this.details.dewPoint = `${tempConverter.FtoC(this.details.dewPoint.split('℉')[0])}℃`;
            this.details.windSpeed = `${(this.details.windSpeed.split('mph')[0] / 2.237).toFixed(1)}m/s`
        }
        // ℃ ℉
    },
    showNotFound(e) {
        this.loading = false;
        this.infoTexts = true;
        this.detailDataTexts = true;
        for (const key in this.details) {
            this.details[key] = '-'
        }
        this.details.country = "Not Found!"
        this.details.city = e.target.firstChild.value;
        this.windDegree = '0'
        this.aqiColor = 'white'
        this.windmillSpeed = '0s';
    },
    showSingleAlert() {
        this.$modal.show('single-alert');
    },
    closeSingleAlert() {
        this.$modal.hide('single-alert');
    },
    showMultipleAlerts() {
        this.$modal.show('multiple-alerts');
    },
    closeMultipleAlerts() {
        this.$modal.hide('multiple-alerts');
    },
    getCurrentYear() {
        let date = new Date();
        this.currentYear = date.getFullYear();
    }
}