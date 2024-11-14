const mongoose = require('mongoose');
const { TABLE_ACTIONS } = require('../commons/constants');
const Log = require('./log');
const { getUpdatedValue } = require('../utils/helpers');

const Schema = mongoose.Schema;
const tableName = 'Employee';

const EmployeeSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      ref: 'Department',
    },
    role: {
      type: String,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
    },
    searchIndex: {
      type: String,
    },
  },
  { timestamps: true },
);

EmployeeSchema.virtual('departmentData', {
  ref: 'Department',
  localField: 'department',
  foreignField: 'id',
  justOne: true,
});

EmployeeSchema.virtual('roleData', {
  ref: 'Role',
  localField: 'role',
  foreignField: 'id',
  justOne: true,
});

// Arrow function don't get their own 'this'. So 'this' variable will empty if use arrow function

EmployeeSchema.pre('save', function (next) {
  this.searchIndex = `${this.id} ${this.name} ${this.phone}`;
  next();
});

EmployeeSchema.pre('findOneAndUpdate', async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  this._update.searchIndex = `${docToUpdate.id} ${getUpdatedValue(
    this._update.name,
    docToUpdate.name,
  )} ${getUpdatedValue(this._update.phone, docToUpdate.phone)}`;
  next();
});

EmployeeSchema.post('save', function (doc) {
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
  'password',
];

EmployeeSchema.post('findOneAndUpdate', function (doc) {
  const { userId } = this.options;
  const updated = Object.keys(EmployeeSchema.paths).reduce((prev, curr) => {
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

EmployeeSchema.post('findOneAndDelete', function (doc) {
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

module.exports = mongoose.model(tableName, EmployeeSchema);
