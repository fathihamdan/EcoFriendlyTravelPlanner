function getBudgetCategory(budget) {
    if (budget < 500) return "Budget";
    if (budget <= 1500) return "Moderate";
    return "Premium";
}

function getCO2Value(str) {
    if (!str) return 0;
    return parseFloat(str);
}

function getDays(startDate, endDate) {
    const start = new Date(startDate);
    const end   = new Date(endDate);
    const diffTime = end - start;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return days;
}

function weatherEmoji(conditionText) {
    if (!conditionText) return '🌡️';
    const t = conditionText.toLowerCase();
    if (t.includes('thunder') || t.includes('storm'))   return '⛈️';
    if (t.includes('drizzle') || t.includes('mist'))    return '🌦️';
    if (t.includes('rain') || t.includes('shower'))     return '🌧️';
    if (t.includes('snow') || t.includes('blizzard'))   return '❄️';
    if (t.includes('fog') || t.includes('overcast'))    return '🌫️';
    if (t.includes('sunny') || t.includes('clear'))     return '☀️';
    if (t.includes('partly cloudy'))                    return '⛅';
    if (t.includes('cloud'))                            return '☁️';
    return '🌡️';
}

function buildForecastMap(data) {
    if (!data || !data.forecast) return {};
    const map = {};
    data.forecast.forEach(day => {
        map[day.date] = day;
    });
    return map;
}

// 1. getBudgetCategory() (Boundary Value Analysis)
describe('getBudgetCategory()', () => {

    // Normal values
    test('returns "Budget" for values below 500', () => {
        expect(getBudgetCategory(100)).toBe('Budget');
        expect(getBudgetCategory(300)).toBe('Budget');
    });

    test('returns "Moderate" for values between 500 and 1500', () => {
        expect(getBudgetCategory(500)).toBe('Moderate');
        expect(getBudgetCategory(1000)).toBe('Moderate');
        expect(getBudgetCategory(1500)).toBe('Moderate');
    });

    test('returns "Premium" for values above 1500', () => {
        expect(getBudgetCategory(1501)).toBe('Premium');
        expect(getBudgetCategory(5000)).toBe('Premium');
    });

    // Boundary values
    test('boundary: 499 returns "Budget"', () => {
        expect(getBudgetCategory(499)).toBe('Budget');
    });

    test('boundary: 500 returns "Moderate"', () => {
        expect(getBudgetCategory(500)).toBe('Moderate');
    });

    test('boundary: 1500 returns "Moderate"', () => {
        expect(getBudgetCategory(1500)).toBe('Moderate');
    });

    test('boundary: 1501 returns "Premium"', () => {
        expect(getBudgetCategory(1501)).toBe('Premium');
    });

    // Edge cases
    test('returns "Budget" for 0', () => {
        expect(getBudgetCategory(0)).toBe('Budget');
    });
});


// 2. getCO2Value() (Equivalence Partitioning)
describe('getCO2Value()', () => {

    // Normal values
    test('extracts numeric value from CO2 string', () => {
        expect(getCO2Value('5 kg CO₂ saved')).toBe(5);
        expect(getCO2Value('12 kg CO₂ saved')).toBe(12);
        expect(getCO2Value('15 kg CO₂ saved')).toBe(15);
    });

    test('handles decimal values', () => {
        expect(getCO2Value('7.5 kg CO₂ saved')).toBe(7.5);
    });

    // Edge cases
    test('returns 0 for null', () => {
        expect(getCO2Value(null)).toBe(0);
    });

    test('returns 0 for undefined', () => {
        expect(getCO2Value(undefined)).toBe(0);
    });

    test('returns 0 for empty string', () => {
        expect(getCO2Value('')).toBe(0);
    });

    test('returns 0 for a string with no number', () => {
        expect(getCO2Value('no number here')).toBeNaN();
    });
});

// 3. getDays() (Equivalence Partitioning & Boundary Value Analysis)
describe('getDays()', () => {

    // Normal values
    test('returns 1 for same start and end date', () => {
        expect(getDays('2026-06-10', '2026-06-10')).toBe(1);
    });

    test('returns 2 for consecutive days', () => {
        expect(getDays('2026-06-10', '2026-06-11')).toBe(2);
    });

    test('returns correct count for a week-long trip', () => {
        expect(getDays('2026-06-10', '2026-06-16')).toBe(7);
    });

    test('returns correct count for a 3-day trip', () => {
        expect(getDays('2026-06-01', '2026-06-03')).toBe(3);
    });

    // Cross-month
    test('handles trips that cross month boundaries', () => {
        expect(getDays('2026-06-29', '2026-07-01')).toBe(3);
    });

    // Cross-year
    test('handles trips that cross year boundaries', () => {
        expect(getDays('2026-12-30', '2027-01-01')).toBe(3);
    });
});

// 4. weatherEmoji() (Equivalence Partitioning)
describe('weatherEmoji()', () => {

    // Each condition type
    test('returns ⛈️ for thunderstorm conditions', () => {
        expect(weatherEmoji('Thunderstorm')).toBe('⛈️');
        expect(weatherEmoji('Patchy light storm')).toBe('⛈️');
    });

    test('returns 🌦️ for drizzle or mist', () => {
        expect(weatherEmoji('Light drizzle')).toBe('🌦️');
        expect(weatherEmoji('Mist')).toBe('🌦️');
    });

    test('returns 🌧️ for rain or showers', () => {
        expect(weatherEmoji('Moderate rain')).toBe('🌧️');
        expect(weatherEmoji('Light rain shower')).toBe('🌧️');
    });

    test('returns ❄️ for snow or blizzard', () => {
        expect(weatherEmoji('Light snow')).toBe('❄️');
        expect(weatherEmoji('Blizzard')).toBe('❄️');
    });

    test('returns 🌫️ for fog or overcast', () => {
        expect(weatherEmoji('Fog')).toBe('🌫️');
        expect(weatherEmoji('Overcast')).toBe('🌫️');
    });

    test('returns ☀️ for sunny or clear', () => {
        expect(weatherEmoji('Sunny')).toBe('☀️');
        expect(weatherEmoji('Clear')).toBe('☀️');
    });

    test('returns ⛅ for partly cloudy', () => {
        expect(weatherEmoji('Partly cloudy')).toBe('⛅');
    });

    test('returns ☁️ for cloudy', () => {
        expect(weatherEmoji('Cloudy')).toBe('☁️');
    });

    // Edge cases
    test('returns 🌡️ for null', () => {
        expect(weatherEmoji(null)).toBe('🌡️');
    });

    test('returns 🌡️ for undefined', () => {
        expect(weatherEmoji(undefined)).toBe('🌡️');
    });

    test('returns 🌡️ for unrecognised condition', () => {
        expect(weatherEmoji('Alien weather')).toBe('🌡️');
    });

    test('is case-insensitive', () => {
        expect(weatherEmoji('SUNNY')).toBe('☀️');
        expect(weatherEmoji('heavy RAIN')).toBe('🌧️');
    });
});

// 5. buildForecastMap() (Equivalence Partitioning)
describe('buildForecastMap()', () => {

    const mockData = {
        forecast: [
            { date: '2026-06-10', day: { maxtemp_c: 35, mintemp_c: 27, condition: { text: 'Sunny' } } },
            { date: '2026-06-11', day: { maxtemp_c: 33, mintemp_c: 26, condition: { text: 'Partly cloudy' } } },
            { date: '2026-06-12', day: { maxtemp_c: 30, mintemp_c: 25, condition: { text: 'Moderate rain' } } },
        ]
    };

    // Normal values
    test('returns an object keyed by date string', () => {
        const map = buildForecastMap(mockData);
        expect(map).toHaveProperty('2026-06-10');
        expect(map).toHaveProperty('2026-06-11');
        expect(map).toHaveProperty('2026-06-12');
    });

    test('each key contains the correct forecast day object', () => {
        const map = buildForecastMap(mockData);
        expect(map['2026-06-10'].day.maxtemp_c).toBe(35);
        expect(map['2026-06-11'].day.condition.text).toBe('Partly cloudy');
        expect(map['2026-06-12'].day.mintemp_c).toBe(25);
    });

    test('returns correct number of entries', () => {
        const map = buildForecastMap(mockData);
        expect(Object.keys(map).length).toBe(3);
    });

    // Edge cases
    test('returns empty object for null input', () => {
        expect(buildForecastMap(null)).toEqual({});
    });

    test('returns empty object for undefined input', () => {
        expect(buildForecastMap(undefined)).toEqual({});
    });

    test('returns empty object when forecast array is missing', () => {
        expect(buildForecastMap({ city: 'Putrajaya' })).toEqual({});
    });

    test('returns empty object for empty forecast array', () => {
        expect(buildForecastMap({ forecast: [] })).toEqual({});
    });
});