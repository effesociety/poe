export const {
    PORT = 5000,
    NODE_ENV = 'development',
    SESS_NAME = 'sid',
    SESS_SECRET = 'secret!session',
    SESS_LIFETIME = 1000 * 60 * 60 * 2,
    MONGO_URI = 'mongodb://localhost:27017/poe'
} = process.env;
