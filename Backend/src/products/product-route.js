const express = require('express');
const router  = express.Router();
const controller = require("./product-controller");


router.get('/', controller.getProducts);
router.post('/create', controller.addProduct);
router.post('/delete', controller.deleteProduct);
router.post('/update', controller.updateProduct);
router.get('/search', controller.searchProduct);
router.get('/searchArchive', controller.searchArchiveProduct);

//router.get('/category', controller.categorySort);
//router.get('/categoryArchive', controller.categoryArchiveSort);
router.post('/archive', controller.archiveProduct);
router.post('/addBack', controller.archiveAddBack);
router.get('/archived', controller.archivedProducts);
router.get('/scan/:id', controller.scanProduct);
router.get('/:id', controller.getProductById);

module.exports = router;