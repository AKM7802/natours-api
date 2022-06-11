const express=require('express')
const userController=require('../controllers/userController')
const authController=require('../controllers/authController')


const userRouter=express.Router();

userRouter.route('/signup').post(authController.signup)
userRouter.post('/login',authController.login)
userRouter.get('/logout',authController.logout)

userRouter.post('/forgotPassword',authController.forgotPassword)
userRouter.patch('/resetPassword/:token',authController.resetPassword)

//Since the below routes all require authController.protect we can make another middleware like below so it is run before any of the routes below that
userRouter.use(authController.protect) //So we do not need to require to write this on every paths

userRouter.patch('/updateMyPassword',authController.updateMyPassword)
// userRouter.patch('/updateMe',upload.single('photo'),userController.updateMe)
userRouter.patch('/updateMe',userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe)
//form-data(instead of raw in body) is used inside postman to upload multi-part datas

userRouter.delete('/deleteMe',userController.deleteMe)

userRouter.get('/me',userController.getMe,userController.getUser)

userRouter.use(authController.restrictTo('admin')); //middleware for below  routes since all must be only used by admin
userRouter.route('/').get(userController.getAllUsers).post(userController.createUser)
userRouter.route('/:id').get(userController.getUser).delete(userController.deleteUser).patch(userController.updateUser)

module.exports=userRouter;