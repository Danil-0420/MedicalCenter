const Router = require('express')
let router = new Router()
const DocSpecController = require('../controllers/DocSpecController')
const CheckRole = require('../middleWare/CheckRoleMiddleWare')

router.post('',CheckRole('ADMIN'), DocSpecController.create)
router.get('', DocSpecController.getAll)

module.exports = router