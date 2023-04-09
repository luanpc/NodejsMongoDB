'use strict'

/*Store Token - Public API*/

const { model, Schema, Types } = require('mongoose'); // Erase if already required
const DOCUMENT_NAME = 'ApiKey'
const COLLECTION_NAME = 'ApiKeys'
// Declare the Schema of the Mongo model
const apiKeySchema = new Schema({
    // Generate key api
    key: {
        type: String,
        required: true,
        unique: true
    },
    //Status: Key hoat động hay k
    status: {
        type: Boolean,
        default: true
    },
    /* Export backend cho nhiều nơi sử dụng caí key naỳ, taọ ra nởi admin.
    Người dùng sẽ dùng caí key add vaò Header của services. Verify database hệ thống thì pass qua
    */
    permissions: {
        type: [String],
        required: true,
        enum: ['0000', '1111', '2222']
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, apiKeySchema);