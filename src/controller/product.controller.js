'use strict'

const ProductServiceSuper = require("../services/product.service.super")
const { SuccessResponse } = require("../core/success.response")

class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new product success!',
            metadata: await ProductServiceSuper.createProduct(
                req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            }
            )
        }).send(res)
    }

    /**
     * @description Get all Drafts for shop
     * @param {Number} limit
     * @param {Number} skip
     * @returns {JSON}
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Draft success!',
            metadata: await ProductServiceSuper.findAllDraftsForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list published product success!',
            metadata: await ProductServiceSuper.findAllPublishForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    //POST
    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Publish product success!',
            metadata: await ProductServiceSuper.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'UnPublish product success!',
            metadata: await ProductServiceSuper.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    searchProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'search products success!',
            metadata: await ProductServiceSuper.searchProducts(req.params)
        }).send(res)
    }

    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Find all products success!',
            metadata: await ProductServiceSuper.findAllProducts(req.query)
        }).send(res)
    }

    findProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Find product success!',
            metadata: await ProductServiceSuper.findProduct({
                product_id: req.params.product_id
            })
        }).send(res)
    }
}

module.exports = new ProductController()