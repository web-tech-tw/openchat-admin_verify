"use strict";

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = new Schema({
    id: String,
    display_name: String,
});