const Router = require('express')
let router = new Router()
const SpecializationController = require('../controllers/SpecializationController')
const CheckRole = require('../middleWare/CheckRoleMiddleWare')

router.post('',CheckRole('ADMIN'),SpecializationController.create)
router.get('', SpecializationController.getAll)
router.delete('/:id', CheckRole('ADMIN'), SpecializationController.delete)

module.exports = router