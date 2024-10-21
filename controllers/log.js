const Log = require('../models/log');

exports.getAllLogs = async ctx => {
  try {
    const logs = await Log.find();
    ctx.body = logs;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.getLogById = async ctx => {
  try {
    const log = await Log.findById(ctx.params.id);
    if (!log) {
      ctx.throw(404, 'Log not found');
    }
    ctx.body = log;
  } catch (err) {
    ctx.throw(500, err);
  }
};

exports.getLogsByCollection = async ctx => {
  try {
    const logs = await Log.find({ tableName: ctx.query.tableName }).sort({
      time: -1,
    });
    ctx.body = logs;
  } catch (err) {
    ctx.throw(500, err);
  }
};
