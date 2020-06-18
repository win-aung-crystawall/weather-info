import { countryCodes } from "./countryCodes";
export const methodsVue = {
    locateUserPosttion() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(res => {
                this.getDefaultData(res)
            })
        }
    },
    async getDefaultData(pos) {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${this.API_KEY}&units=metric`);
        const data = await res.json();
        this.setData(data);
    },
    async getSearchedData(e) {
        if (e.target.firstChild.value) {
            this.infoTexts = false;
            this.loading = true;
            console.log(e.target.firstChild.value)
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${e.target.firstChild.value}&appid=${this.API_KEY}&units=metric`);
            if (res.ok === true) {
                const data = await res.json();
                this.setData(data);
            } else {
                this.showNotFound();
            }
        }
    },
    calcTime(offset) {
        const d = new Date();
        const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        const nd = new Date(utc + (3600000 * offset));
        return {
            hours: nd.getHours(),
            minutes: nd.getMinutes(),
            seconds: nd.getSeconds(),
            timeStr: nd.toTimeString().slice(0, 5)
        }
    },
    setData(data) {
        console.log(data);
        this.loading = false;
        this.infoTexts = true;
        const time = this.calcTime((data.timezone / 60) / 60);
        this.localTime = time.timeStr;
        console.log(time);
        if (time.hours > 7 && time.hours < 18) this.iconId = `owf-${data.weather[0].id}-d`;
        else this.iconId = `owf-${data.weather[0].id}-n`;
        this.city = data.name;
        this.country = countryCodes.find(i => i.Code === data.sys.country).Name;
        this.condition = data.weather[0].main;
        this.conditionDes = data.weather[0].description;
        this.mainTemp = Math.round(data.main.temp);
        this.feelsLikeTemp = Math.round(data.main.feels_like);
        this.maxTemp = Math.round(data.main.temp_max);
        this.minTemp = Math.round(data.main.temp_min);
        this.clouds = data.clouds.all;
        this.humidity = data.main.humidity;
        this.pressure = data.main.pressure;
        this.dewPoint = 'N/A';
        this.uvi = 'N/A';
        if (!(data.visibility)) this.visibility = 'N/A';
        else this.visibility = `${Math.round(data.visibility / 1000)}km`;
        this.setBg(data);
    },
    setBg(data) {
        const time = this.calcTime((data.timezone / 60) / 60)
        let id = data.weather[0].id;
        if (time.hours >= 7 && time.hours <= 18) {
            if (id >= 200 && id <= 531) {
                this.bgImage = 'rain-d'
            } else if (id >= 803 && id <= 804) {
                this.bgImage = 'cloudy-d'
            } else {
                this.bgImage = 'clear-d'
            }
        } else {
            if (id >= 200 && id <= 531) {
                this.bgImage = 'rain-n'
            } else if (id >= 803 && id <= 804) {
                this.bgImage = 'cloudy-n'
            } else {
                this.bgImage = 'clear-n'
            }
        }
    },
    showNotFound () {
        this.loading = false;
        this.infoTexts = true;
        this.country = "Not Found!"
    }
}