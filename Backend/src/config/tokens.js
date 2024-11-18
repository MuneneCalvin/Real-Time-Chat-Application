const tokenTypes = {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'resetPassword',
    VERIFY_EMAIL: 'verifyEmail',
};

const tokenTypeList = Object.values(tokenTypes);

module.exports = {
    tokenTypes,
    tokenTypeList
};