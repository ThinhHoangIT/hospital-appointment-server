const mongoose = require('mongoose');
const { TABLE_ACTIONS } = require('../commons/constants');
const Schema = mongoose.Schema;

const LogSchema = new Schema({
  tableName: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: Object.values(TABLE_ACTIONS),
  },
  userId: {
    type: String,
    required: true,
  },
  recordId: {
    type: String,
    required: true,
  },
  time: {
    type: Number,
    required: true,
  },
  changes: [
    {
      fieldName: String,
      newValue: Schema.Types.Mixed,
    },
  ],
});

LogSchema.index({ tableName: 1 });

module.exports = mongoose.model('Log', LogSchema);
