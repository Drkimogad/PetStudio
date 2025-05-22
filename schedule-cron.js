import { schedule } from '../schedule-cron.js';  // Schedule module for cron job
import { handler } from '../save-subscription.js';  // Assuming save-subscription has a handler

// Import checkAndSendReminders asynchronously
const { checkAndSendReminders } = await import('../lib/check-reminders.js');

export default schedule('0 8 * * *', async (req, res) => {  // Runs every day at 8 AM
  try {
    // 1. Verify cron secret to avoid unauthorized access
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('Unauthorized access attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Timezone verification - logging when the cron job is triggered (in Nairobi time)
    const nairobiTime = new Date().toLocaleString("en-US", {
      timeZone: process.env.TIME_ZONE
    });
    console.log('Cron triggered at Nairobi time:', nairobiTime);

    // 3. Call the function to check and send reminders
    const result = await checkAndSendReminders();

    // 4. Return success response
    return res.status(200).json({
      success: true,
      processedAt: nairobiTime,
      ...result
    });

  } catch (error) {
    // Handle any errors that occur during the cron job execution
    console.error('Cron job failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      time: new Date().toLocaleString("en-US", { timeZone: process.env.TIME_ZONE })
    });
  }
});
