const Voucher = require('../schemas/voucher');
const { CreateError } = require('../utils/errorHandler');

module.exports = {
    GetCart: async function(session) {
        try {
            return session.cart || [];
        } catch (error) {
            next(error);
        }
    },

    AddToCart: async function(session, product, quantity) {
        try {
            if (!session.cart) {
                session.cart = [];
            }

            const existingItem = session.cart.find(item => 
                item.product._id.toString() === product._id.toString()
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                session.cart.push({
                    product: {
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        urlImg: product.urlImg
                    },
                    quantity: quantity
                });
            }

            return session.cart;
        } catch (error) {
            next(error);
        }
    },

    RemoveFromCart: async function(session, productId) {
        try {
            session.cart = session.cart.filter(item => 
                item.product._id.toString() !== productId.toString()
            );
            return session.cart;
        } catch (error) {
            next(error);
        }
    },

    ClearCart: async function(session) {
        try {
            session.cart = [];
            return true;
        } catch (error) {
            next(error);
        }
    },

    ApplyVoucher: async function(session, voucherCode) {
        try {
            const voucher = await Voucher.findOne({ 
                code: voucherCode,
                isDeleted: false,
                expireDate: { $gt: new Date() },
                quantity: { $gt: 0 }
            });

            if (!voucher) {
                throw CreateError('Voucher không hợp lệ', 400);
            }

            session.voucher = {
                code: voucher.code,
                discount: voucher.discount,
                voucherId: voucher._id
            };

            return this.CalculateTotal(session);
        } catch (error) {
            next(error);
        }
    },

    RemoveVoucher: async function(session) {
        try {
            delete session.voucher;
            return this.CalculateTotal(session);
        } catch (error) {
            throw CreateError(error.message, 500);
        }
    },

    CalculateTotal: async function(session) {
        try {
            const cart = session.cart || [];
            const total = cart.reduce((sum, item) => 
                sum + (item.product.price * item.quantity), 0);

            let discount = 0;
            let finalPrice = total;

            if (session.voucher) {
                discount = (total * session.voucher.discount) / 100;
                finalPrice = total - discount;
            }

            return {
                items: cart,
                total,
                discount,
                finalPrice,
                voucher: session.voucher || null
            };
        } catch (error) {
            next(error);
        }
    }
};