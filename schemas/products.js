const mongoose = require('mongoose');
const slugify = require('slugify');

let productSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true }, 
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 0, required: true, min: 0 },
    description: { type: String, default: "" },
    urlImg: { type: String, default: "" },
    category: { type: mongoose.Types.ObjectId, ref: 'category', required: true },
    brand: { type: mongoose.Types.ObjectId, ref: 'brand', required: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

productSchema.pre('save', function(next) {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model('product', productSchema);
