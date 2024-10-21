const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee = require('../models/employee');
const Department = require('../models/department');
const Role = require('../models/role');
const {
  validateEmployee,
  validateEmployeeLogin,
} = require('../utils/validate');

exports.getAllEmployees = async ctx => {
  try {
    const query = {};
    if (ctx.query.keyword) {
      query.searchIndex = { $regex: ctx.query.keyword, $options: 'i' };
    }
    const employees = await Employee.find(query)
      .select('-__v -_id')
      .populate('departmentData', '-_id id name')
      .populate('roleData', '-_id id name')
      .lean();
    ctx.body = employees?.map(employee => {
      employee.hasPassword = employee.password ? true : false;
      employee.password = undefined;
      return employee;
    });
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.getEmployeeById = async ctx => {
  try {
    const employee = await Employee.findOne({ id: ctx.params.id })
      .select('-password -__v -_id')
      .populate('departmentData', '-_id id name')
      .populate('roleData', '-_id id name');
    if (!employee) {
      ctx.throw(404, 'Employee not found');
    }
    employee.hasPassword = employee.password ? true : false;
    employee.password = undefined;
    ctx.body = employee;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.createEmployee = async ctx => {
  try {
    const data = ctx.request.body;
    const { error } = validateEmployee(data);
    if (error) {
      ctx.throw(400, error.details[0].message);
    }

    if (data.department) {
      const department = await Department.findOne({ id: data.department });
      if (!department) {
        ctx.throw(400, 'Department not found');
      }
    }

    if (data.role) {
      const role = await Role.findOne({ id: data.role });
      if (!role) {
        ctx.throw(400, 'Role not found');
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 6);
    }

    const hasEmployee = await Employee.findOne({ id: data.id });
    if (hasEmployee) {
      ctx.throw(400, 'Employee is already exists');
    }

    if (data.phone) {
      const hasPhone = await Employee.findOne({ phone: data.phone });
      if (hasPhone) {
        ctx.throw(400, 'Phone is already exists');
      }
    }

    const newEmployee = new Employee(data);
    newEmployee._userId = ctx.state.user.id;
    const savedEmployee = await newEmployee.save();

    savedEmployee.password = undefined;
    ctx.body = savedEmployee;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.updateEmployee = async ctx => {
  try {
    const data = ctx.request.body;
    const { error } = validateEmployee(data, true);
    if (error) {
      ctx.throw(400, error.details[0].message);
    }

    if (data.department) {
      const department = await Department.findOne({ id: data.department });
      if (!department) {
        ctx.throw(400, 'Department not found');
      }
    }

    if (data.role) {
      const role = await Role.findOne({ id: data.role });
      if (!role) {
        ctx.throw(400, 'Role not found');
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 6);
    }

    if (data.phone) {
      const hasPhone = await Employee.findOne({ phone: data.phone });
      if (hasPhone && ctx.params.id !== hasPhone.id) {
        ctx.throw(400, 'Phone is already exists');
      }
    }

    const updatedEmployee = await Employee.findOneAndUpdate(
      { id: ctx.params.id },
      data,
      { new: true, userId: ctx.state.user.id },
    ).select('-password -_id -__v');
    if (!updatedEmployee) {
      ctx.throw(404, 'Employee not found');
    }

    ctx.body = updatedEmployee;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.deleteEmployee = async ctx => {
  try {
    const employee = await Employee.findOneAndDelete(
      { id: ctx.params.id },
      { userId: ctx.state.user.id, id: ctx.params.id },
    );
    if (!employee) {
      ctx.throw(404, 'Employee not found');
    }

    ctx.body = 'Employee was deleted';
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.login = async ctx => {
  const { error } = validateEmployeeLogin(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
  }

  const { phone, password } = ctx.request.body;
  const employee = await Employee.findOne({ phone }).select('-_id -__v').lean();
  if (!employee) {
    ctx.throw(400, 'Invalid phone or password');
  }

  const validPassword = await bcrypt.compare(password, employee.password);
  if (!validPassword) {
    ctx.throw(400, 'Invalid phone or password');
  }

  const token = jwt.sign(
    { id: employee.id, role: employee.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRE_TIME },
  );

  const refreshToken = jwt.sign(
    { id: employee.id },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.REFRESH_JWT_EXPIRE_TIME },
  );

  delete employee.password;

  ctx.body = {
    ...employee,
    token,
    refreshToken,
  };
};

exports.refreshToken = async ctx => {
  const { refreshToken } = ctx.request.body;
  try {
    const { id } = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);

    const employee = await Employee.findOne({ id }).select('-_id -__v').lean();
    if (!employee) {
      ctx.throw(400, 'Invalid token');
    }
    const newToken = jwt.sign(
      { id: employee.id, role: employee.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRE_TIME },
    );
    const newRefreshToken = jwt.sign(
      { id: employee.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.REFRESH_JWT_EXPIRE_TIME },
    );
    ctx.body = {
      ...employee,
      token: newToken,
      refreshToken: newRefreshToken,
    };
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.changePassword = async ctx => {
  const { phone, oldPassword, newPassword } = ctx.request.body;
  const employee = await Employee.findOne({ phone });
  if (!employee) {
    ctx.throw(400, 'Invalid phone or password');
  }
  const validPassword = await bcrypt.compare(oldPassword, employee.password);
  if (!validPassword) {
    ctx.throw(400, 'Invalid phone or password');
  }
  employee.password = await bcrypt.hash(newPassword, 6);
  await employee.save();
  ctx.body = 'Password changed successfully';
};

exports.resetPassword = async ctx => {
  const { phone, newPassword } = ctx.request.body;
  const employee = await Employee.findOne({ phone });
  if (!employee) {
    ctx.throw(400, 'Invalid phone');
  }
  employee.password = await bcrypt.hash(newPassword, 6);
  await employee.save();
  ctx.body = 'Password reset successfully';
};
