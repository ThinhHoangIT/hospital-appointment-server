const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const Schema = mongoose.Schema;

const InvoiceSchema = new Schema({
  userId: { type: ObjectId, required: true, ref: 'User' },
  appointmentId: {
    type: ObjectId,
    required: true,
    ref: 'Appointment',
  },
  prescriptionId: {
    type: ObjectId,
    required: true,
    ref: 'Prescription',
  },
  amount: { type: Number, required: true },
});

const Invoice = mongoose.model('Invoice', InvoiceSchema);
module.exports = Invoice;
