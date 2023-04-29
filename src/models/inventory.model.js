'use strict'

const { model, Schema, Types } = require('mongoose'); // Erase if already required
const DOCUMENT_NAME = 'Inventory'
const COLLECTION_NAME = 'Inventories'
// Declare the Schema of the Mongo model
const inventorySchema = new Schema({
    // Generate key api
    inven_productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    inven_location: { type: String, default: 'Unknow' },
    inven_stock: { type: Number, required: true },
    inven_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    inven_reservations: { type: Array, default: [] } // Dat hang truoc
    /*
        cardId:
        stock: 1
        createdOn:
    */
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, inventorySchema);