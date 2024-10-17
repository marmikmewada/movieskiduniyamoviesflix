// app/api/scheduler/route.js
import cron from 'node-cron';
import scrapeData from '../../scrapper'; // Adjust the path as needed

let isSchedulerRunning = false;

const startScheduler = async () => {
    if (isSchedulerRunning) return; // Prevent multiple initializations

    console.log('Initializing the scraper scheduler...');
    isSchedulerRunning = true;

    try {
        // Run the scraper immediately on app start
        await scrapeData();
    } catch (error) {
        console.error('Error during initial scraping:', error.message);
    }

    // Schedule the scraper to run every 24 hours
    cron.schedule('0 0 * * *', () => {
        console.log('Running scraper at scheduled time...');
        scrapeData();
    });
};

// Initialize the scheduler when the API route is called
export async function GET(req) {
    startScheduler(); // Start the scheduler
    return new Response(JSON.stringify({ message: 'Scheduler initialized' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
