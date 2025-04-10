const Banner = require('../schemas/banner');

module.exports = {
  GetAllBanners: async function () {
    return await Banner.find({ isDeleted: false });
  },

  GetBannerById: async function (id) {
    return await Banner.findOne({ _id: id, isDeleted: false });
  },

  CreateBanner: async function (img_url, title = "") {
    const newBanner = new Banner({ img_url, title });
    return await newBanner.save();
  },

  UpdateBanner: async function (id, data) {
    return await Banner.findByIdAndUpdate(id, { $set: data }, { new: true });
  },

  DeleteBanner: async function (id) {
    return await Banner.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }
};
