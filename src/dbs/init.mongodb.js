'use strict'

const mongoose = require('mongoose')
const { db: { host, name, port } } = require('../config/config.mongodb')
const { countConnect } = require('../helpers/check.connect')

const connectString = `mongodb://${host}:${port}/${name}`
console.log(connectString)
class Database {
    constructor() {
        this.connect()
    }

    //connect
    connect(type = 'mongodb') {
        if (1 === 1) {
            mongoose.set('debug', true)
            mongoose.set('debug', { color: true })
        }

        mongoose.connect(connectString).then(_ =>
            console.log(`Connected MongoDB success PRO`, countConnect())
        ).catch(err => console.log(`Error connect!`))
    }

    /*if connect Oracle...write here

    */

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database()
        }
        return Database.instance
    }
}

const instanceMongoDB = Database.getInstance()
module.exports = instanceMongoDB