const dotenv = require('dotenv');
dotenv.config({
    path: './config.env'
});

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION!!! shutting down...');
    console.log(err)
    process.exit(1);
});

const app = require('./app');

port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Application is running on port ${port}`);
})