const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const Schema = mongoose.Schema;

const AppointmentSchema = new Schema(
  {
    userId: { type: ObjectId, required: true, ref: 'User' },
    employeeId: {
      type: String,
      required: true,
      ref: 'Employee',
    },
    departmentId: {
      type: String,
      required: true,
      ref: 'Department',
    },
    date: { type: String, required: true },
    shift: { type: String, required: true, enum: ['morning', 'afternoon'] },
    status: {
      type: String,
      required: true,
      enum: ['scheduled', 'completed', 'canceled'],
    },
  },
  { timestamps: true },
);

AppointmentSchema.virtual('employeeData', {
  ref: 'Employee',
  localField: 'employeeId',
  foreignField: 'id',
  justOne: true,
});

AppointmentSchema.virtual('departmentData', {
  ref: 'Department',
  localField: 'departmentId',
  foreignField: 'id',
  justOne: true,
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);
module.exports = Appointment;
