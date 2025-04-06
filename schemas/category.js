const mongoose = require('mongoose');
const slugify = require('slugify');

let categorySchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true }, // Thêm slug
    description: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

categorySchema.pre('save', function(next) {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model('category', categorySchema);
