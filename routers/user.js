const express = require('express');


const { getMyprofile, logout, registeration, login, adminLogin, getAllUsers, changePassword, addLocationInformation, deleteAllUsers, updateUserRole, updatePersonalInfo, forgetPassword, resetPassword, refresh_Token } = require('../controllers/user');
const { isAuthenticated, authorizeRole } = require('../middlewares/auth');

const router = express.Router();

router.route('/auth/register').post(registeration);
router.route('/auth/login').post(login);
router.route('/auth/refresh-token').post(refresh_Token);
router.post('/auth/admin-login', adminLogin);
router.route('/auth/change-password').put(isAuthenticated, changePassword);
router.post('/auth/forgetpassword', forgetPassword);
router.put('/auth/resetpassword/:token', resetPassword);
router.route('/me').get(isAuthenticated, getMyprofile);
router.route('/addlocation').put(isAuthenticated, addLocationInformation);
router.route('/updateperfonalinfo').put(isAuthenticated, updatePersonalInfo);
router.route('/admin/users').get(isAuthenticated, authorizeRole(["admin"]), getAllUsers);
router.route('/admin/users/:id').delete(isAuthenticated, authorizeRole(["admin"]), deleteAllUsers)
router.route('/admin/user/:id/updateRole').put(isAuthenticated, authorizeRole(['admin']), updateUserRole )

router.route('/logout').get(logout);
module.exports = router;