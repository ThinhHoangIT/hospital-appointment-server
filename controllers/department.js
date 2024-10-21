const Department = require('../models/department');
const { validateDepartment } = require('../utils/validate');

exports.getAllDepartments = async ctx => {
  try {
    const query = {};
    if (ctx.query.keyword) {
      query.searchIndex = { $regex: ctx.query.keyword, $options: 'i' };
    }
    const departments = await Department.find(query);
    ctx.body = departments;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.getDepartmentById = async ctx => {
  try {
    const department = await Department.findOne({ id: ctx.params.id });
    if (!department) {
      ctx.throw(404, 'Department not found');
    }
    ctx.body = department;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.createDepartment = async ctx => {
  try {
    const data = ctx.request.body;
    const { error } = validateDepartment(data);
    if (error) {
      ctx.throw(400, error.details[0].message);
    }

    const hasDepartment = await Department.findOne({ id: data.id });
    if (hasDepartment) {
      ctx.throw(400, 'Department is already exists');
    }

    const newDepartment = new Department(data);
    newDepartment._userId = ctx.state.user.id;
    const savedDepartment = await newDepartment.save();

    ctx.body = savedDepartment;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.updateDepartment = async ctx => {
  try {
    const data = ctx.request.body;
    const { error } = validateDepartment(data, true);
    if (error) {
      ctx.throw(400, error.details[0].message);
    }

    const updatedDepartment = await Department.findOneAndUpdate(
      { id: ctx.params.id },
      data,
      { new: true, userId: ctx.state.user.id },
    );
    if (!updatedDepartment) {
      ctx.throw(404, 'Department not found');
    }

    ctx.body = updatedDepartment;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.deleteDepartment = async ctx => {
  try {
    const department = await Department.findOneAndDelete(
      {
        id: ctx.params.id,
      },
      { userId: ctx.state.user.id, id: ctx.params.id },
    );
    if (!department) {
      ctx.throw(404, 'Department not found');
    }

    ctx.body = department;
  } catch (err) {
    ctx.throw(500, err);
  }
};
