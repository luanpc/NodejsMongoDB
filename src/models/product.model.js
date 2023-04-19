'use strict'

const { model, Schema } = require('mongoose'); // Erase if already required
const slugify = require('slugify')

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

// Declare the Schema of the Mongo model
var productSchema = new Schema({
    product_name: { type: String, required: true }, //Quan jean cao cap
    product_thumb: { type: String, required: true },
    product_description: String,
    product_slug: String, // quan-jean-cao-cap
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: {
        type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture']
    },
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    product_attributes: { type: Schema.Types.Mixed, required: true },
    //more
    product_ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must above 1.0'],
        max: [5, 'Rating must under 5.0'],
        set: (val) => Math.round(val * 10) / 10
    },
    product_variation: { type: Array, default: [] },
    isDraft: { type: Boolean, default: true, index: true, select: false },
    isPublished: { type: Boolean, default: false, index: true, select: false }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

// create index for search
productSchema.index({ product_name: 'text', product_description: 'text' })

// Document middleware runs before .save() and .create()....
productSchema.pre('save', function (next) {
    this.product_slug = slugify(this.product_name, { lower: true })
    next()
})

// define the product type = clothing
const clothingSchema = new Schema({
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" }
}, {
    collection: 'clothes',
    timestamps: true
})

// define the product type = Electronics
const electronicSchema = new Schema({
    manufacturer: { type: String, required: true },
    model: String,
    color: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" }
}, {
    collection: 'electronics',
    timestamps: true
})

// define the product type = Furniturer
const furnitureSchema = new Schema({
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" }
}, {
    collection: 'furnitures',
    timestamps: true
})

//Export the model
module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    clothing: model('Electronics', clothingSchema),
    electronic: model('Clothing', electronicSchema),
    furniture: model('Furniture', furnitureSchema),
}