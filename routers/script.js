const express = require('express');
const { updateAndRetrieveSanitizedActivities, updateActivitiesWithSlugs, convertToCamelCase, sendActivitiesToApi } = require('../controllers/scripts');
const router = express.Router();


router.get('/sanitized-activities', updateAndRetrieveSanitizedActivities);
router.get('/update-activities-with-slugs', updateActivitiesWithSlugs);
router.get('/convert-to-camel-case', convertToCamelCase);
router.post('/send-activities-to-api', sendActivitiesToApi);
module.exports = router;
