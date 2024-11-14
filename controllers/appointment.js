const Appointment = require('../models/appointment');

exports.getAllAppointments = async ctx => {
  try {
    const query = {
      departmentId: ctx.query.department,
    };
    if (ctx.query.keyword) {
      query.searchIndex = { $regex: ctx.query.keyword, $options: 'i' };
    }
    if (ctx.query.startTime) {
      query.date = {
        $gte: new Date(parseInt(ctx.query.startTime)),
      };
    }
    if (ctx.query.endTime) {
      query.date = {
        ...query.date,
        $lte: new Date(parseInt(ctx.query.endTime)),
      };
    }
    const appointments = await Appointment.find(query)
      .select('-__v')
      .populate('userId', '-__v')
      .populate('departmentData', '-__v')
      .lean();
    ctx.body = appointments;
  } catch (err) {
    ctx.throw(500, err);
  }
};
exports.createAppointment = async ctx => {
  try {
    const data = ctx.request.body;
    const newAppointment = new Appointment(data);
    const savedAppointment = await newAppointment.save();
    ctx.body = savedAppointment;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.getAppointmentsByUserId = async ctx => {
  try {
    const appointments = await Appointment.find({
      userId: ctx.params.id,
    });
    ctx.body = appointments;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.deleteAppointment = async ctx => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: ctx.params.id,
      userId: ctx.state.user.id,
    });
    if (!appointment) {
      ctx.throw(404, 'Appointment not found');
    }
    ctx.body = appointment;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.updateAppointmentStatus = async ctx => {
  try {
    const { newStatus } = ctx.request.body;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: ctx.params.id },
      { status: newStatus },
      { new: true },
    );
    if (!appointment) {
      ctx.throw(404, 'Appointment not found');
    }
    ctx.body = appointment;
  } catch (err) {
    ctx.throw(500, err);
  }
};
