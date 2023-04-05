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

// init db
require('./dbs/init.mongodb')
//checkOverload()
// init routes
app.get('/', (req, res, next) => {
    //const srtCompress = 'Hello ae'
    return res.status(200).json({
        message: 'Welcome !!!',
        //metadata: srtCompress.repeat(100000)
    })
})

// handling error

module.exports = app