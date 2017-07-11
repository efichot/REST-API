import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';
import routes from './routes/index';
import mongoose from 'mongoose';

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

mongoose.connect('mongodb://localhost:27017/qa');

const db = mongoose.connection;

db.on('error', function(err) {
	console.error('Connection error: ' + err);
})

db.once('open', function() {
	console.log('db connection succesful');
});

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", '*'); //ok for req from any domain
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); //which headers are accepted
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT,POST,DELETE');
		return res.status(200).json({});
	}
	next();
})

app.use('/questions', routes);

// catch 404 status code and forward to error handler
app.use((req, res, next) => {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

//Error Handler
app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.json({
		error: {
			message: err.message
		}
	});
	next();
})

// connect to db
initializeDb( db => {

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/api', api({ config, db }));

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
	});
});

export default app;
