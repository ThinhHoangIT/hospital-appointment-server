const getUpdatedValue = (newValue, oldValue) => {
  if (newValue === null || newValue === undefined) {
    return oldValue;
  }
  return newValue;
};

module.exports = {
  getUpdatedValue,
};
