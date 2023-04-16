'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, AuthFailureError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    static logout = async (keyStore) => {
        return delKey = await KeyTokenService.removeKeyById(keyStore._id)
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