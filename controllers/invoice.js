const Invoice = require('../models/invoice');
const Medication = require('../models/medication');

exports.getAllInvoices = async ctx => {
  try {
    const query = {};
    if (ctx.query.keyword) {
      query.searchIndex = { $regex: ctx.query.keyword, $options: 'i' };
    }
    const invoices = await Invoice.find(query)
      .select('-__v')
      .populate('user', '-__v')
      .populate('appointment', '-__v')
      .lean();

    for (const invoice of invoices) {
      if (invoice.medication) {
        const medications = await Medication.find({
          id: { $in: invoice.medication },
        });
        invoice.medication = medications.map(med => med.name);
      }
    }

    ctx.body = invoices;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.getAllInvoiceById = async ctx => {
  try {
    const invoice = await Invoice.findById(ctx.params.id)
      .select('-__v')
      .populate('user', '-__v')
      .populate('appointment', '-__v')
      .populate('medication', 'name')
      .lean();
    if (!invoice) {
      ctx.throw(404, 'Invoice not found');
    }
    ctx.body = invoice;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.createInvoice = async ctx => {
  try {
    const data = ctx.request.body;
    const newInvoice = new Invoice(data);
    const savedInvoice = await newInvoice.save();
    ctx.body = savedInvoice;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.updateInvoice = async ctx => {
  try {
    const data = ctx.request.body;
    const invoice = await Invoice.findOneAndUpdate(
      { _id: ctx.params.id },
      data,
      { new: true },
    );
    if (!invoice) {
      ctx.throw(404, 'Invoice not found');
    }
    ctx.body = invoice;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.getInvoiceByAppointmentId = async ctx => {
  try {
    const invoice = await Invoice.findOne({
      appointment: ctx.params.id,
    })
      .select('-__v')
      .populate('user', '-__v')
      .populate('appointment', '-__v')
      .lean();
    if (!invoice) {
      ctx.throw(404, 'Invoice not found');
    }

    if (invoice.medication) {
      const medications = await Medication.find({
        id: { $in: invoice.medication },
      });
      invoice.medication = medications.map(med => med.name);
    }

    ctx.body = invoice;
  } catch (err) {
    ctx.throw(500, err);
  }
};
