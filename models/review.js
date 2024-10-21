const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
  {
    userId: { type: ObjectId, required: true, ref: 'User' },
    employeeId: {
      type: String,
      required: true,
      ref: 'Employee',
    },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String },
  },
  { timestamps: true },
);

ReviewSchema.virtual('employeeData', {
  ref: 'Employee',
  localField: 'employeeId',
  foreignField: 'id',
  justOne: true,
});

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
