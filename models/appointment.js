const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AppointmentSchema = new Schema(
  {
    userId: { type: String, required: true, ref: 'User' },
    departmentId: {
      type: String,
      required: true,
      ref: 'Department',
    },
    date: { type: Number, required: true },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'approved', 'rejected'],
    },
  },
  { timestamps: true },
);

AppointmentSchema.virtual('departmentData', {
  ref: 'Department',
  localField: 'departmentId',
  foreignField: 'id',
  justOne: true,
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);
module.exports = Appointment;
