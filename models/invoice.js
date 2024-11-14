const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const InvoiceSchema = new Schema(
  {
    user: { type: String, required: true, ref: 'User' },
    appointment: {
      type: String,
      required: true,
      ref: 'Appointment',
    },
    medication: [{ type: String, required: true, ref: 'Medication' }],
    amount: { type: Number, required: true },
    desc: { type: String, required: true },
  },
  { timestamps: true },
);

const Invoice = mongoose.model('Invoice', InvoiceSchema);
module.exports = Invoice;
