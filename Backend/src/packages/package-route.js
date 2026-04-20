const express = require('express');
const router = express.Router();
const controller = require('./package-controller');

router.get('/', controller.getPackage);
router.post('/create', controller.addPackage);
router.post('/delete', controller.deletePackage); // This handles both archive AND permanent delete
router.post('/update', controller.updatePackage);
router.get('/sellers/list', controller.getSellers);
router.get('/:id', controller.getPackageById);
router.get('/archived/all', controller.getArchivedPackages);
router.post('/restore', controller.restorePackage);
// REMOVE THIS LINE: router.post('/delete-permanent', controller.permanentDeletePackage);
router.post('/cleanup-archives', async (req, res) => {
    try {
        const deletedCount = await controller.cleanupOldArchives();
        res.status(200).json({ 
            message: `Cleaned up ${deletedCount} old archived packages`,
            deletedCount 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;