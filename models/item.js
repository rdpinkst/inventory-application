const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: String, required: true },
    number_in_stock: { type: String, required: true },
    picture: { type: String },
})

ItemSchema.virtual("url").get(function() {
    return `/inventory/item/${this._id}`;
})

module.exports = mongoose.model("Item", ItemSchema);