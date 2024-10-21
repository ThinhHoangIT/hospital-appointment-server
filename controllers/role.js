const Role = require('../models/role');
const { validateRole } = require('../utils/validate');

exports.getAllRoles = async ctx => {
  try {
    const query = {};
    if (ctx.query.keyword) {
      query.searchIndex = { $regex: ctx.query.keyword, $options: 'i' };
    }
    const roles = await Role.find(query);
    ctx.body = roles;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.getRoleById = async ctx => {
  try {
    const role = await Role.findOne({ id: ctx.params.id });
    if (!role) {
      ctx.throw(404, 'Role not found');
    }
    ctx.body = role;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.createRole = async ctx => {
  try {
    const data = ctx.request.body;
    const { error } = validateRole(data);
    if (error) {
      ctx.throw(400, error.details[0].message);
    }

    const hasRole = await Role.findOne({ id: data.id });
    if (hasRole) {
      ctx.throw(400, 'Role is already exists');
    }

    const newRole = new Role(data);
    newRole._userId = ctx.state.user.id;
    const savedRole = await newRole.save();

    ctx.body = savedRole;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.updateRole = async ctx => {
  try {
    const data = ctx.request.body;
    const { error } = validateRole(data, true);
    if (error) {
      ctx.throw(400, error.details[0].message);
    }

    const updatedRole = await Role.findOneAndUpdate(
      { id: ctx.params.id },
      data,
      { new: true, userId: ctx.state.user.id },
    );
    if (!updatedRole) {
      ctx.throw(404, 'Role not found');
    }

    ctx.body = updatedRole;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.deleteRole = async ctx => {
  try {
    const role = await Role.findOneAndDelete(
      { id: ctx.params.id },
      { userId: ctx.state.user.id, id: ctx.params.id },
    );
    if (!role) {
      ctx.throw(404, 'Role not found');
    }

    ctx.body = role;
  } catch (err) {
    ctx.throw(500, err);
  }
};
