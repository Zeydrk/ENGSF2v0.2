const { cleanupOldArchives } = require('./packages/package-controller');

function setupArchiveCleanup() {
    // Run immediately on startup (to catch any missed cleanups)
    console.log('[' + new Date().toISOString() + '] Running initial archive cleanup...');
    cleanupOldArchives().then(deletedCount => {
        if (deletedCount > 0) {
            console.log(`Initial cleanup: Deleted ${deletedCount} old archived packages`);
        }
    }).catch(error => {
        console.error('Initial cleanup failed:', error);
    });

    // Then check for old archives every day (24 hours) instead of every hour
    setInterval(async () => {
        console.log('[' + new Date().toISOString() + '] Scheduled archive cleanup running...');
        try {
            const deletedCount = await cleanupOldArchives();
            if (deletedCount > 0) {
                console.log(`Cleaned up ${deletedCount} old archived packages`);
            } else {
                console.log('No old archives to clean up');
            }
        } catch (error) {
            console.error('Archive cleanup failed:', error);
        }
    }, 24 * 60 * 60 * 1000); // Run every 24 hours (daily)

    console.log('Archive cleanup scheduler started (runs daily)');
}

module.exports = { setupArchiveCleanup };