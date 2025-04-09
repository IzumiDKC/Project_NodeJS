const Voucher = require('../schemas/voucher');

module.exports = {
    async createVoucher(req, res) {
        try {
            const { code, discount, quantity, expireDate } = req.body;
            const voucher = new Voucher({ code, discount, quantity, expireDate });
            await voucher.save();
            res.status(201).json({ message: 'Tạo voucher thành công', voucher });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getAllVoucher(req, res) {
        try {
            const vouchers = await Voucher.find({ isDeleted: false });
            res.status(200).json(vouchers);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async updateVoucher(req, res) {
        try {
            const { id } = req.params;
            const voucher = await Voucher.findByIdAndUpdate(id, req.body, { new: true });
            if (!voucher) return res.status(404).json({ error: 'Không tìm thấy voucher' });
            res.status(200).json({ message: 'Cập nhật thành công', voucher });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async deleteVoucher(req, res) {
        try {
            const { id } = req.params;
            const voucher = await Voucher.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
            if (!voucher) return res.status(404).json({ error: 'Không tìm thấy voucher' });
            res.status(200).json({ message: 'Xoá thành công' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async applyVoucher(req, res) {
        try {
            const { code, totalPrice } = req.body;
    
            const voucher = await Voucher.findOne({ code, isDeleted: false });
    
            if (!voucher) return res.status(404).json({ message: 'Voucher không tồn tại' });
    
            if (new Date(voucher.expireDate) < new Date()) {
                return res.status(400).json({ message: 'Voucher đã hết hạn' });
            }
    
            if (voucher.quantity <= 0) {
                return res.status(400).json({ message: 'Voucher đã hết lượt sử dụng' });
            }
    
            let discountAmount = (totalPrice * voucher.discount) / 100;
            if (discountAmount > totalPrice) discountAmount = totalPrice; 
    
            const finalPrice = totalPrice - discountAmount;
    
            res.status(200).json({
                message: 'Áp dụng voucher thành công',
                voucher: {
                    code: voucher.code,
                    percent: voucher.discount,
                    amount: discountAmount
                },
                discountAmount,
                finalPrice
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};