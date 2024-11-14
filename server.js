const Koa = require('koa');
const Router = require('koa-router');
const jwt = require('koa-jwt');
const { koaBody } = require('koa-body');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('@koa/cors');

const responseMiddleware = require('./middleware/response');
const customJWTMiddleware = require('./middleware/jwt');

// Import routes
const logRoutes = require('./routes/log');
const userRoutes = require('./routes/user');
const employeeRoutes = require('./routes/employee');
const roleRoutes = require('./routes/role');
const departmentRoutes = require('./routes/department');
const workScheduleRoutes = require('./routes/workSchedule');
const appointmentRoutes = require('./routes/appointment');
const medicationRoutes = require('./routes/medication');
const invoiceRoutes = require('./routes/invoice');

// Load environment variables
dotenv.config();

// Create Koa application
const app = new Koa();

// Create Koa router
const router = new Router();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

app.use(koaBody());
app.use(customJWTMiddleware);
app.use(cors());
app.use(responseMiddleware);

app.use(
  jwt({
    secret: process.env.JWT_SECRET_KEY,
    algorithm: 'RS256',
  }).unless({
    path: [/auth/, /users/],
  }),
);
// Routes middleware
router.use('/api/users', userRoutes.routes());
router.use('/api/employees', employeeRoutes.routes());
router.use('/api/roles', roleRoutes.routes());
router.use('/api/logs', logRoutes.routes());
router.use('/api/departments', departmentRoutes.routes());
router.use('/api/schedules', workScheduleRoutes.routes());
router.use('/api/appointments', appointmentRoutes.routes());
router.use('/api/medications', medicationRoutes.routes());
router.use('/api/invoices', invoiceRoutes.routes());

app.use(router.routes());
app.use(router.allowedMethods({ throw: true }));

// Start the server
const port = process.env.PORT || 7000;
app.listen(port, () => console.log(`Server started on port ${port}`));
