import fs from 'fs';
import path from 'path';

export async function GET(req) {
    try {
        const filePath = path.join(process.cwd(), 'data', 'scrapedData.json');
        
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return new Response(JSON.stringify({ message: 'Data is not yet available. Please check back soon.' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Read the JSON file
        const data = fs.readFileSync(filePath, 'utf-8');

        // Check if data is empty
        if (!data) {
            return new Response(JSON.stringify({ message: 'Data is not yet available. Please check back soon.' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Parse the JSON data
        const jsonData = JSON.parse(data);
        
        // Return the data as a JSON response
        return new Response(JSON.stringify(jsonData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error reading scrapedData.json:', error);
        return new Response('Error reading data', {
            status: 500,
        });
    }
}
