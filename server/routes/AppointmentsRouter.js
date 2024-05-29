const Router = require('express');
const appointmentController = require('../controllers/appointmentController');
const CheckRole = require("../middleWare/CheckRoleMiddleWare");
const authMiddleWare = require("../middleWare/AuthMiddleWare");

let router = new Router();

router.post('', CheckRole('USER'), authMiddleWare, appointmentController.create);
router.get('/:id', authMiddleWare, appointmentController.getOne);
router.get('/user/:type', CheckRole(['ADMIN', 'USER', 'DOCTOR']), appointmentController.getByType);
router.put('/:id', CheckRole(['ADMIN', 'DOCTOR']), authMiddleWare, appointmentController.updateAppointment);



module.exports = router;