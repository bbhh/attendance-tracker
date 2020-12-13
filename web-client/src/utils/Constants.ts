const Constants = {
    API_BASE_URL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080/api',
    CALENDAR_JUMP_IN_DAYS: 7,
};

export default Constants;