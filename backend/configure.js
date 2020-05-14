export const {
    PORT = 5000,
    NODE_ENV = 'development',
    SESS_NAME = 'sid',
    SESS_SECRET = 'secret!session',
    SESS_LIFETIME = 1000 * 60 * 60 * 2,
    MONGO_URI = 'mongodb+srv://poe:XDrsCNfTx9iOc5Dy@cosmoscluster-ctn6b.mongodb.net/test?retryWrites=true&w=majority'
} = process.env;

