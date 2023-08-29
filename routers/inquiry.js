const express = require("express");
const { isAuthenticated, authorizeRole } = require("../middlewares/auth");
const { createInquiry, getAllInquiryHistory, adminGetAllInquiry, updateInquiryStatus, deleteInquiry } = require("../controllers/inquiry");
const router = express.Router();


router.route('/packages/:packageId/inquiry').post(isAuthenticated, createInquiry);
router.route('/packages/inquiry/user').get(isAuthenticated, getAllInquiryHistory);
router.route('/admin/inquiries').get(isAuthenticated, authorizeRole(['admin']), adminGetAllInquiry);
router.route('/admin/update/inquiry/:id').put(isAuthenticated, authorizeRole(['admin']), updateInquiryStatus);
router.route('/admin/delete/inquiry/:id').delete(isAuthenticated, authorizeRole(['admin']), deleteInquiry);
module.exports = router;