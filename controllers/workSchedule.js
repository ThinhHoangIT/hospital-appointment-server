const WorkSchedule = require('../models/workSchedule');

exports.getAllWorkSchedules = async ctx => {
  try {
    const { department } = ctx.query;
    const query = {};
    if (department) {
      query.department = department;
    }
    const workSchedules = await WorkSchedule.find(query)
      .select('-_id -__v')
      .populate('employeeData', '-_id -__v')
      .lean({ virtuals: true });

    ctx.body = workSchedules;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.getWorkScheduleById = async ctx => {
  try {
    const workSchedule = await WorkSchedule.findOne({ id: ctx.params.id });
    if (!workSchedule) {
      ctx.throw(404, 'WorkSchedule not found');
    }
    ctx.body = workSchedule;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.createWorkSchedule = async ctx => {
  try {
    const data = ctx.request.body;

    const hasWorkSchedule = await WorkSchedule.findOne({ id: data.id });
    if (hasWorkSchedule) {
      ctx.throw(400, 'WorkSchedule is already exists');
    }

    const newWorkSchedule = new WorkSchedule(data);
    newWorkSchedule._userId = ctx.state.user.id;
    const savedWorkSchedule = await newWorkSchedule.save();

    ctx.body = savedWorkSchedule;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.updateWorkSchedule = async ctx => {
  try {
    const data = ctx.request.body;

    const updatedWorkSchedule = await WorkSchedule.findOneAndUpdate(
      { id: ctx.params.id },
      data,
      { new: true, userId: ctx.state.user.id },
    );
    if (!updatedWorkSchedule) {
      ctx.throw(404, 'WorkSchedule not found');
    }

    ctx.body = updatedWorkSchedule;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.deleteWorkSchedule = async ctx => {
  try {
    const workSchedule = await WorkSchedule.findOneAndDelete(
      {
        id: ctx.params.id,
      },
      { userId: ctx.state.user.id, id: ctx.params.id },
    );
    if (!workSchedule) {
      ctx.throw(404, 'WorkSchedule not found');
    }

    ctx.body = workSchedule;
  } catch (err) {
    ctx.throw(500, err);
  }
};
