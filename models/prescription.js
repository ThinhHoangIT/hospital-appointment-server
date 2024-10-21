const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const Schema = mongoose.Schema;

const PrescriptionSchema = new Schema({
  appointmentId: {
    type: ObjectId,
    required: true,
    ref: 'Appointment',
  },
  employeeId: {
    type: String,
    required: true,
    ref: 'Employee',
  },
  medicationDetails: { type: String },
});

AppointmentSchema.virtual('employeeData', {
  ref: 'Employee',
  localField: 'employeeId',
  foreignField: 'id',
  justOne: true,
});

const Prescription = mongoose.model('Prescription', PrescriptionSchema);
module.exports = Prescription;
