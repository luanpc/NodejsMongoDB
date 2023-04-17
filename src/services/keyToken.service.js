'use strict'

const keytokenModel = require("../models/keytoken.model")
const { Types, ObjectId } = require('mongoose')
class KeyTokenService {
    //level 0
    static createKey = async ({ userId, publicKey, privateKey }) => {
        try {
            const tokens = await keytokenModel.create({
                user: userId,
                publicKey,
                privateKey
            })

            return tokens ? tokens.publicKey : null
        } catch (error) {
            return error
        }
    }

    //level 1
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            const filter = { user: userId }, update = {
                publicKey, privateKey, refreshTokenUsed: [], refreshToken
            }, options = { upsert: true, new: true }

            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)
            return tokens ? tokens.publicKey : null

        } catch (error) {
            return error
        }
    }

    static findByUserId = async (userId) => {
        return await keytokenModel.findOne({ user: userId }).lean()
    }

    static removeKeyById = async (id) => {
        return await keytokenModel.findOneAndRemove(id)
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshTokenUsed: refreshToken }).lean()
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshToken })
    }

    static deleteKeyById = async (userId) => {
        return await keytokenModel.findOneAndDelete({ user: userId })
    }
}

module.exports = KeyTokenService