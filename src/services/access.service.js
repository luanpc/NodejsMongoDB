'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError } = require("../core/error.response")
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

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
                const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem'
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem'
                    }
                })

                //console.log(privateKey, publicKey) // needing save to collection KeyStore
                const publicKeyString = await KeyTokenService.createKey({
                    userId: newShop._id,
                    publicKey
                })

                if (!publicKeyString) {
                    throw new BadRequestError('Key store error')
                    // return {
                    //     code: 'xxx',
                    //     message: 'publicKeyString error'
                    // }
                }

                //create token pair
                const tokens = await createTokenPair({ userId: newShop._id, email }, publicKeyString, privateKey)
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