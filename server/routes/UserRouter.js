const Router = require('express')
let router = new Router()
const userController = require('../controllers/UserController')
const authMiddleWare = require('../middleWare/AuthMiddleWare')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleWare, userController.check)
router.get('/:id', authMiddleWare, userController.getUserById)
router.put('/:id', authMiddleWare, userController.updateUserInfo)


module.exports = router