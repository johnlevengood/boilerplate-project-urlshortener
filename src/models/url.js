const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    original_url: String,
},{
    timestamps: true
})

const Url = mongoose.model('Url', urlSchema)

module.exports = Url