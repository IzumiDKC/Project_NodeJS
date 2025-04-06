// models/menu.js
const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    text: { type: String, required: true },
    url: { type: String, required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', default: null }
}, {
    timestamps: true
});

module.exports = mongoose.model('Menu', menuSchema);
