'use strict'
const JWT = require('jsonwebtoken')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const asyncHandler = require('../helpers/asyncHandler')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        //accessToken 
        const accessToken = await JWT.sign(payload, publicKey, {
            //algorithm: 'RS256',
            expiresIn: '2 days'
        })
        //refreshToken
        const refreshToken = await JWT.sign(payload, privateKey, {
            //algorithm: 'RS256',
            expiresIn: '7 days'
        })

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.log(`Error verify::`, err);
            } else {
                console.log(`Decode verify::`, decode);
            }
        })
        return { accessToken, refreshToken }
    } catch (error) {

    }
}

// for Logout
const authenication = asyncHandler(async (req, res, next) => {
    /*
    1- Check userId missing??
    2- Check user in db + Check keyStore with this userId
    3- Verify refreshToken
    4- Verify accessToken
    5- OK all -> Return next()
    */

    //Step 1
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid Request')
    //Step 2
    const keyStore = await findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Not found keyStore')

    //Step 3
    if (req.headers[HEADER.REFRESHTOKEN]) {
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN]
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
            if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserID')

            req.keyStore = keyStore
            req.user = decodeUser
            req.refreshToken = refreshToken
            return next()
        } catch (error) {
            throw error
        }
    }

    //Step 4
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) throw new AuthFailureError('Invalid Request')

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserID')
        req.keyStore = keyStore
        req.user = decodeUser
        return next()

    } catch (error) {
        throw error
    }
})


const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret)
}
module.exports = {
    createTokenPair,
    authenication,
    verifyJWT
}