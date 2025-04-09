var roleModel = require('../schemas/role');

module.exports = {
  GetAllRoles: async function () {
    return await roleModel.find({ isDeleted: false });
  },

  GetRoleById: async function (id) {
    return await roleModel.findOne({ _id: id, isDeleted: false });
  },

  CreateARole: async function(name, description = "") {
    try {
      let newRole = new roleModel({
        name: name,
        description: description
      });
      return await newRole.save();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  UpdateRole: async function (id, data) {
    try {
      let updated = await roleModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      );
      return updated;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  DeleteRole: async function (id) {
    try {
      return await roleModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }
};
