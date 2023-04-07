'use strict'

const express = require('express')
const router = express.Router()

router.use('/v1/api', require('./access'))

// router.get('/', (req, res, next) => {
//     //const srtCompress = 'Hello ae'
//     return res.status(200).json({
//         message: 'Welcome !!!',
//         //metadata: srtCompress.repeat(100000)
//     })
// })

module.exports = router