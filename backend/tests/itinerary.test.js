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

// 1. getBudgetCategory() — Boundary Value Analysis
describe('getBudgetCategory()', () => {

    // Normal values
    test('returns "Budget" for values below 500', () => {
        expect(getBudgetCategory(100)).toBe('Budget');
    });                                                  // ← was missing this

    // Boundary values
    test('boundary: 499 returns "Budget"', () => {
        expect(getBudgetCategory(499)).toBe('Budget');
    });

    test('boundary: 1501 returns "Premium"', () => {
        expect(getBudgetCategory(1501)).toBe('Premium');
    });

    // Edge cases
    test('returns "Budget" for 0', () => {
        expect(getBudgetCategory(0)).toBe('Budget');
    });
});

// 2. getCO2Value() — Equivalence Partitioning
describe('getCO2Value()', () => {

    // Normal values
    test('extracts numeric value from CO2 string', () => {
        expect(getCO2Value('5 kg CO₂ saved')).toBe(5);
    });

    test('handles decimal values', () => {
        expect(getCO2Value('7.5 kg CO₂ saved')).toBe(7.5);
    });

    // Edge cases
    test('returns 0 for null', () => {
        expect(getCO2Value(null)).toBe(0);
    });
});

// 3. getDays() — Equivalence Partitioning & Boundary Value Analysis
describe('getDays()', () => {

    // Normal values
    test('returns 1 for same start and end date', () => {
        expect(getDays('2026-06-10', '2026-06-10')).toBe(1);
    });

    test('returns correct count for a week-long trip', () => {
        expect(getDays('2026-06-10', '2026-06-16')).toBe(7);
    });

    // Cross-month
    test('handles trips that cross month boundaries', () => {
        expect(getDays('2026-06-29', '2026-07-01')).toBe(3);
    });

});

// 4. weatherEmoji() — Equivalence Partitioning
describe('weatherEmoji()', () => {

    test('returns ⛈️ for thunderstorm conditions', () => {
        expect(weatherEmoji('Thunderstorm')).toBe('⛈️');
    });

    test('returns ☀️ for sunny or clear', () => {
        expect(weatherEmoji('Sunny')).toBe('☀️');
    });

    // Edge cases
    test('returns 🌡️ for null', () => {
        expect(weatherEmoji(null)).toBe('🌡️');
    });

});
