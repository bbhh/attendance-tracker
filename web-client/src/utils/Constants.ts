const Constants = {
    API_BASE_URL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8080/api',
    CALENDAR_JUMP_IN_DAYS: 7,
    START_DATE: '2020-12-13',
};

export default Constants;