const express = require("express");
const { isAuthenticated, authorizeRole } = require("../middlewares/auth");
const { createInquiry, getAllInquiryHistory, adminGetAllInquiry, deleteInquiry, createInquiryForAdmin, updateInquiryById, getInquiryById } = require("../controllers/inquiry");
const router = express.Router();


router.route('/packages/:packageId/inquiry').post(isAuthenticated, createInquiry);
router.route('/admin/inquiries').post(isAuthenticated, authorizeRole(['admin']), createInquiryForAdmin)
router.route('/packages/inquiry/user').get(isAuthenticated, getAllInquiryHistory);
router.route('/admin/inquiries').get(isAuthenticated, authorizeRole(['admin']), adminGetAllInquiry);
router.route('/admin/inquiries/:id').get(isAuthenticated, authorizeRole(["admin"]), getInquiryById)
router.route('/admin/update/inquiry/:id').put(isAuthenticated, authorizeRole(['admin']), updateInquiryById);
router.route('/admin/delete/inquiry/:id').delete(isAuthenticated, authorizeRole(['admin']), deleteInquiry);
module.exports = router;