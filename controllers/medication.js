const Medication = require('../models/medication');

exports.getAllMedications = async ctx => {
  try {
    const query = {};
    if (ctx.query.keyword) {
      query.searchIndex = { $regex: ctx.query.keyword, $options: 'i' };
    }
    const medications = await Medication.find(query);
    ctx.body = medications;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.getMedicationById = async ctx => {
  try {
    const medication = await Medication.findOne({ id: ctx.params.id });
    if (!medication) {
      ctx.throw(404, 'Medication not found');
    }
    ctx.body = medication;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.createMedication = async ctx => {
  try {
    const data = ctx.request.body;

    const hasMedication = await Medication.findOne({ id: data.id });
    if (hasMedication) {
      ctx.throw(400, 'Medication is already exists');
    }

    const newMedication = new Medication(data);
    newMedication._userId = ctx.state.user.id;
    const savedMedication = await newMedication.save();

    ctx.body = savedMedication;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.updateMedication = async ctx => {
  try {
    const data = ctx.request.body;

    const updatedMedication = await Medication.findOneAndUpdate(
      { id: ctx.params.id },
      data,
      { new: true, userId: ctx.state.user.id },
    );
    if (!updatedMedication) {
      ctx.throw(404, 'Medication not found');
    }

    ctx.body = updatedMedication;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.deleteMedication = async ctx => {
  try {
    const medication = await Medication.findOneAndDelete(
      {
        id: ctx.params.id,
      },
      { userId: ctx.state.user.id, id: ctx.params.id },
    );
    if (!medication) {
      ctx.throw(404, 'Medication not found');
    }

    ctx.body = medication;
  } catch (err) {
    ctx.throw(500, err);
  }
};
