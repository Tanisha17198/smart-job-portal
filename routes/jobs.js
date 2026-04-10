const router = require('express').Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');

router.get('/', jobController.getAllJobs);
router.get('/recommend', auth, jobController.getRecommendations);
router.post('/apply', auth, jobController.applyToJob);

module.exports = router;