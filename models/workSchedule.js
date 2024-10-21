const mongoose = require('mongoose');
const { TABLE_ACTIONS } = require('../commons/constants');
const Log = require('./log');
const { getUpdatedValue } = require('../utils/helpers');

const Schema = mongoose.Schema;
const tableName = 'WorkSchedule';

const WorkScheduleSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    employee: {
      type: String,
      required: true,
      ref: 'Employee',
    },
    department: {
      type: String,
      required: true,
      ref: 'Department',
    },
    dayOfWeek: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3, 4, 5],
    },
    shift: {
      type: String,
      required: true,
      enum: ['morning', 'afternoon'],
    },
    status: {
      type: String,
      required: true,
      enum: ['on', 'off'],
      default: 'on',
    },
    searchIndex: {
      type: String,
    },
  },
  { timestamps: true },
);

WorkScheduleSchema.virtual('employeeData', {
  ref: 'Employee',
  localField: 'employee',
  foreignField: 'id',
  justOne: true,
});

WorkScheduleSchema.virtual('departmentData', {
  ref: 'Department',
  localField: 'department',
  foreignField: 'id',
  justOne: true,
});

// Arrow function don't get their own 'this'. So 'this' variable will empty if use arrow function

WorkScheduleSchema.pre('save', function (next) {
  this.searchIndex = `${this.id} ${this.employee}`;
  next();
});

WorkScheduleSchema.pre('findOneAndUpdate', async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  this._update.searchIndex = `${docToUpdate.id} ${getUpdatedValue(
    this._update.employee,
    docToUpdate.employee,
  )}`;
  next();
});

WorkScheduleSchema.post('save', function (doc) {
  const log = new Log({
    tableName,
    action: TABLE_ACTIONS.ADD,
    userId: doc._userId,
    recordId: doc.id,
    time: Date.now(),
  });
  log.save();
});

const logFieldsExcluded = [
  '_id',
  'id',
  '__v',
  'updatedAt',
  'createdAt',
  'searchIndex',
];

WorkScheduleSchema.post('findOneAndUpdate', function (doc) {
  const { userId } = this.options;
  const updated = Object.keys(WorkScheduleSchema.paths).reduce((prev, curr) => {
    if (
      !logFieldsExcluded.includes(curr) &&
      this.getUpdate().$set[curr] !== null &&
      this.getUpdate().$set[curr] !== undefined
    ) {
      prev.push({
        fieldName: curr,
        newValue: this.getUpdate().$set[curr],
      });
    }
    return prev;
  }, []);

  const log = new Log({
    tableName,
    action: TABLE_ACTIONS.UPDATE,
    userId,
    recordId: doc.id,
    time: Date.now(),
    changes: updated,
  });
  log.save();
});

WorkScheduleSchema.post('findOneAndDelete', function (doc) {
  const { userId, id } = this.options;

  const log = new Log({
    tableName,
    action: TABLE_ACTIONS.DELETE,
    userId,
    recordId: id,
    time: Date.now(),
  });
  log.save();
});

module.exports = mongoose.model(tableName, WorkScheduleSchema);
