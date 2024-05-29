const Router = require('express')
let router = new Router()
const DepartmentController = require('../controllers/DepartmentController')
const CheckRole = require('../middleWare/CheckRoleMiddleWare')

router.post('',CheckRole('ADMIN'),DepartmentController.create)
router.get('', DepartmentController.getAll)
// router.delete('/:id', CheckRole('ADMIN'), DepartmentController.delete)

module.exports = router