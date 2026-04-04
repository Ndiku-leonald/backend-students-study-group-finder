const { test } = require('../controllers/testController');
router.get('/test', test);
const router = express.Router();

router.get('/', (req, res) => {
  res.send("Main API route working");
});

module.exports = router;