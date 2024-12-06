import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class WeatherService {

    // must append start_date and end_date before calling
    private readonly startDateParam = "&start_date=";
    private readonly endDateParam = "&end_date="
    private readonly latLngOmaha = "latitude=41&longitude=95";
    private readonly forecastApi = "https://api.open-meteo.com/v1/forecast?";

    constructor(private http: HttpClient) {
    }

    getForecastUrl(): string {
        return this.forecastApi + this.latLngOmaha + "&hourly=temperature_2m,apparent_temperature&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FChicago";
    }

    // Built to assume weather at 5am
    async getForecastWeatherForDate(date: Date) {
        const startDate = this.formatDateToYYYYMMDD(date)
        const url = this.getForecastUrl() + this.startDateParam + startDate + this.endDateParam + startDate;
        const result = await this.http.get<WeatherData>(url).toPromise();
        return this.formatDegreeString(result?.hourly.temperature_2m[5]);
    }

    private formatDegreeString(temp: number | undefined): string {
        if (!temp)
            return "Unknown";

        return `${Math.round(temp)}°F`;
    }

    async getFeelsLikeForDate(date: Date) {
        const startDate = this.formatDateToYYYYMMDD(date)
        const url = this.getForecastUrl() + this.startDateParam + startDate + this.endDateParam + startDate;
        const result = await this.http.get<WeatherData>(url).toPromise();
        return this.formatDegreeString(result?.hourly.apparent_temperature[5]);
    }

    async getWeatherForWeek(startDate: Date, endDate: Date): Promise<string[]> {
        const startDateString = this.formatDateToYYYYMMDD(startDate)
        const endDateString = this.formatDateToYYYYMMDD(endDate);
        const url = this.getForecastUrl() + this.startDateParam + startDateString + this.endDateParam + endDateString;
        const result = await this.http.get<WeatherData>(url).toPromise();

        if (!result?.hourly) {
            return [];
        } else {
            const temps: string[] = [];
            for (let i = 5; i < result.hourly.time.length; i += 24) {
                const temp = result.hourly.apparent_temperature[i];
                const tempString = this.formatDegreeString(temp);
                temps.push(tempString);
            }

            return temps;
        }
    }

    private formatDateToYYYYMMDD(date: Date) {
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
    
        return `${year}-${month}-${day}`;
    }

}

export interface WeatherData {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    hourly_units : {
        time: string;
        temperature_2m: string;
        apparent_temperature: string;
    },
    hourly: {
        time: string[];
        temperature_2m: number[];
        apparent_temperature: number[];
    }
}
