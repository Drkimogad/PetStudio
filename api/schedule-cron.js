import { schedule } from '../vercel/cron';
import handler(req, res) from '../save-subscription';

const { checkAndSendReminders } = await import('../lib/check-reminders');
await checkAndSendReminders();
});

  export default schedule('0 8 * * *', async () => {  // 8AM daily
  try {
    // 1. Verify cron secret
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Timezone verification
    const nairobiTime = new Date().toLocaleString("en-US", {
      timeZone: process.env.TIME_ZONE
    });
    console.log('Cron triggered at Nairobi time:', nairobiTime);

    // 3. Process reminders
    const result = await checkAndSendReminders();
    
    return res.status(200).json({
      success: true,
      processedAt: nairobiTime,
      ...result
    });

  } catch (error) {
    console.error('Cron job failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      time: new Date().toLocaleString("en-US", { timeZone: process.env.TIME_ZONE })
    });
  }
}
