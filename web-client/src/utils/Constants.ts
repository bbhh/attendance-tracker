const Constants = {
    API_BASE_URL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8080/api',
    CALENDAR_JUMP_IN_DAYS: 7,
    START_DATE_DAYS_AGO: 365,
    START_DATE_WEEKS_AGO: 52,
};

export default Constants;