const Router = require('express')
const CheckRole = require("../middleWare/CheckRoleMiddleWare");
let router = new Router()
const ScheduleController = require('../controllers/ScheduleController')

router.post('', CheckRole('ADMIN'), ScheduleController.create)
router.put('/:doctorId', CheckRole('ADMIN'), ScheduleController.update)

// Роут для получения всей информации о расписании
// router.get('', ScheduleController.getAll);

// Роут для получения полного расписания одного доктора
router.get('/:doctorId', ScheduleController.getByDoctor);

module.exports = router;

