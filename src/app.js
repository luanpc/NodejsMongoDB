'use strict'

const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
require('dotenv').config()
const { checkOverload } = require('./helpers/check.connect')
const app = express()

// init middlewares
app.use(morgan('dev')) // morgan has 5 main type: combined, common, short, tiny, dev
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// init db
require('./dbs/init.mongodb')
//checkOverload()

// init routes
app.use('/', require('./routes'))

// handling error

module.exports = app