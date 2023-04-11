'use strict'

const AccessService = require("../services/access.service")
const { OK, CREATED, SuccessResponse } = require("../core/success.response")

class AccessController {
    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AccessService.login(req.body)
        }).send(res)
    }

    signUp = async (req, res, next) => {
        /*
        200: OK
        201: CREATED
        */
        // Use Success Handler response
        new CREATED({
            message: 'Registered OK',
            metadata: await AccessService.signUp(req.body),
            option: {
                limit: 10
            }
        }).send(res)

        //return res.status(201).json(await AccessService.signUp(req.body))
    }
}

module.exports = new AccessController()