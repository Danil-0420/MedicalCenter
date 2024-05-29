const Router = require('express')
let router = new Router()
const UserRouter = require('./UserRouter')
const DoctorListRouter = require('./DoctorListRouter')
const AppointmentRouter = require('./AppointmentsRouter')
const Feedback = require('./feedbackRouter')
const schedule = require('./ScheduleRouter')
const Department = require('./DepartmentRouter')
const Specialization = require('./SpecializationRouter')
const DocSpec = require('./DocSpecRouter')


router.use('/doctor', DoctorListRouter)
router.use('/appointment', AppointmentRouter)
router.use('/feedback', Feedback)
router.use('/department', Department)
router.use('/specialization', Specialization)
router.use('/schedule', schedule)
router.use('/user', UserRouter)
router.use('/docspec', DocSpec)


module.exports = router