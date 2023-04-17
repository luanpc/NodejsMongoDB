'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")
const keytokenModel = require("../models/keytoken.model")
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    // check token used
    static handleRefreshToken = async (refreshToken) => {

        //check xem token da duoc su dung chua?
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        // YES
        if (foundToken) {
            // decode xem who are they
            const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
            console.log('[1]--', { userId, email })
            //xoa tat ca token trong keyStore
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something wrong happend !! Please reLogin')
        }
        //NO
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if (!holderToken) throw new AuthFailureError(' Shop not registered')

        //verifyToken
        const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
        console.log('[2]--', { userId, email })
        //check userId
        const foundShop = await findByEmail({ email })

        if (!foundShop) throw new AuthFailureError(' Shop not registered')

        // create 1 cap token moi
        const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey)

        // update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokenUsed: refreshToken // da duoc su dung de lay token moi
            }
        })

        return {
            user: { userId, email },
            tokens
        }
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        return delKey
    }

    static login = async ({ email, password, refreshToken = null }) => {
        // Step 1: Check email in db
        const findShop = await findByEmail({ email })
        if (!findShop) throw new BadRequestError('Shop not registered')

        // Step 2: Match password
        const match = bcrypt.compare(password, findShop.password)
        if (!match) throw new AuthFailureError('Authenication error')

        // Step 3: Create AT vs RT 
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        // Step 4: Generate tokens
        const { _id: userId } = findShop
        const tokens = await createTokenPair({ userId: findShop._id, email }, publicKey, privateKey)
        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey,
            userId
        })

        // Step 5: Get data return login
        return {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: findShop }),
            tokens
        }


    }

    static signUp = async ({ name, email, password }) => {
        try {
            // check email exist??
            const shopHolder = await shopModel.findOne({ email }).lean() // lean -> query nhanh trả về Object Javacript thuần

            if (shopHolder) {
                //Use handler
                throw new BadRequestError('Error: Shop already registered !')
                // return {
                //     code: 'xxxx',
                //     message: 'Shop already registered !'
                // }
            }

            const passwordHash = await bcrypt.hash(password, 10) // 10: độ khó của thuật toán, số cao ảnh hg CPU
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            if (newShop) {
                // created privateKey, publicKey
                // rsa: sử dụng thuật toán bất đối xứng
                // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // })

                //console.log(privateKey, publicKey) // needing save to collection KeyStore
                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')

                console.log({ privateKey, publicKey });

                const keyStore = await KeyTokenService.createKey({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })

                if (!keyStore) {
                    //throw new BadRequestError('Key store error')
                    return {
                        code: 'xxx',
                        message: 'publicKeyString error'
                    }
                }

                //create token pair
                const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
                console.log(`Create Token Success::`, tokens);
                return {
                    code: 201,
                    metadata: {
                        //using Lodash
                        shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
                        tokens
                    }
                }
            }
            return {
                code: 200,
                metadata: null
            }
        } catch (error) {
            throw new BadRequestError(error.message)
            // return {
            //     code: 'xxx',
            //     message: error.message,
            //     status: 'error'
            // }
        }
    }
}

module.exports = AccessService