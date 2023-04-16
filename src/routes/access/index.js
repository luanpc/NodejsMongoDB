'use strict'

const express = require('express')
const { authenication } = require('../../auth/authUtils')
const accessController = require('../../controller/access.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const router = express.Router()

//signUp
router.post('/shop/signup', asyncHandler(accessController.signUp))
//signIn
router.post('/shop/login', asyncHandler(accessController.login))

// ==========authenication=========
router.use(authenication)
///////////////
router.post('/shop/logout', asyncHandler(accessController.logout))
module.exports = router