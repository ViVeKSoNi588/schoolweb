import Feedback from '../models/Feedback.js';

// Auto-cleanup function: Delete feedback that was read more than 3 months ago
export const cleanupOldFeedback = async () => {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const result = await Feedback.deleteMany({
            isRead: true,
            readAt: { $lte: threeMonthsAgo }
        });

        if (result.deletedCount > 0) {
            console.log(`🗑️ Auto-cleanup: Deleted ${result.deletedCount} old read feedback entries`);
        }
    } catch (error) {
        console.error('❌ Error in feedback cleanup:', error.message);
    }
};

export const startCleanupJob = () => {
    // Run cleanup on server start with small delay
    setTimeout(() => cleanupOldFeedback(), 5000);

    // Run cleanup every 24 hours
    setInterval(() => cleanupOldFeedback(), 24 * 60 * 60 * 1000);
};
