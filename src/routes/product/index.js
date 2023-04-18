'use strict'

const express = require('express')
const { authenication } = require('../../auth/authUtils')
const productController = require('../../controller/product.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const router = express.Router()

// ==========authenication=========
router.use(authenication)
///////////////
router.post('', asyncHandler(productController.createProduct))

module.exports = router