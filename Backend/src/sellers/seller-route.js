const express = require('express');
const router = express.Router();
const controller = require('./seller-controller');

router.get('/', controller.getSeller);
router.post('/create', controller.addSeller);
router.post('/delete', controller.deleteSeller);
router.post('/update', controller.updateSeller);
router.post('/claim', controller.claimSeller);

module.exports = router;
