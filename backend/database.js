const mongoose = require('mongoose')

function DbConnect() {
	const DB_URL = process.env.DB_URL;

	//databse connection
	mongoose.connect(DB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		// useFindAndModify: false,

	})
	const db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection errro:'))
	db.once('open', () => {
		console.log('DB connected...')	
	})
}

module.exports = DbConnect