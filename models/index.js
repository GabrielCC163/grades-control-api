import mongoose from 'mongoose';

const db = {
	mongoose: mongoose,
	url: process.env.MONGODB
};

const gradeSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	subject: {
		type: String,
		required: true
	},
	type: {
		type: String,
		required: true
	},
	value: {
		type: Number,
		required: true
	},
	lastModified: {
		type: Date,
		default: Date.now
	}
});

const gradeModel = mongoose.model('grade', gradeSchema, 'grade');

export { db, gradeModel };
