const mongoose = require('mongoose');
const Schema = require('module').Schema;

const user_schema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'basic',
        enum: ['basic', 'admin']
    },
    accessToken: {
        type: String
    }
});

module.exports = mongoose.model('User', user_schema);