const express = require("express");
const router = express.Router();
const { isAuthenticated, authorizeRole } = require("../middlewares/auth");
const {
  createPakage,
  updatePakageById,
  deletePakageById,
  createPakageReview,
  deletePakageReview,
  getAllPakages,
  getPakageById,
  getAllPakageReviews,
  getPakagesBySlug,
} = require("../controllers/pakage");
const multipleUpload = require("../middlewares/multer");

// Pakage Routes
router
  .route("/pakages")
  .post(isAuthenticated, authorizeRole(["admin"]), multipleUpload, createPakage)
  .get(getAllPakages);

router
  .route("/pakages/:id")
  .get(getPakageById)
  .put(
    isAuthenticated,
    authorizeRole(["admin"]),
    multipleUpload,
    updatePakageById
  )
  .delete(
    isAuthenticated,
    authorizeRole(["admin"]),
    multipleUpload,
    deletePakageById
  );

router.route("/pakages/slug/:slug").get(getPakagesBySlug);

// Pakage Review Routes
router
  .route("/pakages/:id/reviews")
  .put(isAuthenticated, createPakageReview)
  .get(getAllPakageReviews);

router
  .route("/pakages/:pakageId/reviews/:reviewId")
  .delete(isAuthenticated, deletePakageReview);

module.exports = router;
