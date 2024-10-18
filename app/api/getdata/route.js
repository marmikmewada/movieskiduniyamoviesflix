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

        // Organize data by category, filter out items without relevant links, and remove duplicates
        const organizedData = jsonData.reduce((acc, item) => {
            const category = item.parentLink;

            // Initialize the category in the accumulator if not present
            if (!acc[category]) {
                acc[category] = [];
            }

            // Filter out items with no href in relevantLinks
            if (item.relevantLinks && item.relevantLinks.some(link => link.href)) {
                const newItem = {
                    childLink: item.childLink,
                    title: item.title,
                    imgSrc: item.imgSrc,
                    relevantLinks: item.relevantLinks.filter(link => link.href), // Keep only links with href
                };

                // Check for duplicates
                const isDuplicate = acc[category].some(existingItem => 
                    existingItem.childLink === newItem.childLink &&
                    existingItem.title === newItem.title &&
                    existingItem.imgSrc === newItem.imgSrc &&
                    JSON.stringify(existingItem.relevantLinks) === JSON.stringify(newItem.relevantLinks)
                );

                // Push newItem only if it's not a duplicate
                if (!isDuplicate) {
                    acc[category].push(newItem);
                }
            }

            return acc;
        }, {});

        // Return the organized data as a JSON response
        return new Response(JSON.stringify(organizedData), {
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
