const Router = require('express')
let router = new Router()
const DoctorListController = require('../controllers/DoctorListController')
const CheckRole = require('../middleWare/CheckRoleMiddleWare')

router.post('',CheckRole('ADMIN'),DoctorListController.create)
router.get('', DoctorListController.getAll)
router.get('/:id', DoctorListController.getOne)
router.put('/:id', CheckRole('ADMIN'), DoctorListController.update);
router.delete('/:id', CheckRole('ADMIN'), DoctorListController.delete);

module.exports = router