const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizSchema = new Schema({
	level : {
		type: String,
	  	required: true
	},
	question : {
		type: String,
	  	required: true
	},
	ansChoice : {
		type: Array,
		required: true
	},
	code1 : {
		type: String
	},
	code2 : {
		type: String
	}
});

const Quiz = mongoose.model('Quiz', quizSchema); //--> looking for quizs collection in database
module.exports = Quiz;