'use strict'

const express = require('express')
const { authenication } = require('../../auth/authUtils')
const productController = require('../../controller/product.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const router = express.Router()

router.get('/search/:keySearch', asyncHandler(productController.searchProducts))
router.get('', asyncHandler(productController.findAllProducts))
router.get('/:product_id', asyncHandler(productController.findProduct))
// ==========authenication=========
router.use(authenication)
//End authenication

//POST
router.post('', asyncHandler(productController.createProduct))
router.post('/publish/:id', asyncHandler(productController.publishProductByShop))
router.post('/unpublish/:id', asyncHandler(productController.unPublishProductByShop))
//QUERY
router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop))
router.get('/published/all', asyncHandler(productController.getPublishForShop))

module.exports = router