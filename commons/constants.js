const FEATURES = {
  ADMIN: 'admin',
  MANAGE_PATIENT: 'manage_patient',
  MANAGE_SCHEDULE: 'manage_schedule',
  MANAGE_MEDICINE: 'manage_medicine',
  MANAGE_DOCTOR: 'manage_doctor',
};

const USER_STATUSES = {
  ACTIVE: 'active',
  DEACTIVE: 'deactive',
};

const PRODUCT_STATUSES = {
  IN_STOCK: 'in-stock',
  OUT_OF_STOCK: 'out-of-stock',
  DISCONTINUED: 'discontinued',
};

const PRODUCT_TYPES = {
  IN_STOCK: 'electronics',
  FASHION: 'fashion',
  BEAUTY: 'beauty',
  JEWELRY: 'jewelry',
};

const PHONE_REGEX = /(0[3|5|7|8|9])+([0-9]{8})\b/;
const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const TABLE_ACTIONS = {
  ADD: 'add',
  UPDATE: 'update',
  DELETE: 'delete',
};

module.exports = {
  FEATURES,
  USER_STATUSES,
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
  PHONE_REGEX,
  EMAIL_REGEX,
  TABLE_ACTIONS,
};
