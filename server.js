const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Enhanced manga search endpoint
app.get('/manga', async (req, res) => {
    try {
        const { title, limit = 20, offset = 0 } = req.query;
        
        if (!title) {
            return res.status(400).json({ error: 'Title parameter is required' });
        }

        const url = `https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=${limit}&offset=${offset}&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&order[relevance]=desc`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`MangaDex API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Error fetching manga:', error);
        res.status(500).json({ error: 'Failed to fetch manga data' });
    }
});

// Popular manga endpoint for home page recommendations
app.get('/manga/popular', async (req, res) => {
    try {
        // Fetch popular manga using MangaDex API
        const url = 'https://api.mangadex.org/manga?limit=12&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&order[followedCount]=desc&hasAvailableChapters=true';
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`MangaDex API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Error fetching popular manga:', error);
        res.status(500).json({ error: 'Failed to fetch popular manga data' });
    }
});

// Latest updates endpoint
app.get('/manga/latest', async (req, res) => {
    try {
        const url = 'https://api.mangadex.org/manga?limit=12&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&order[latestUploadedChapter]=desc&hasAvailableChapters=true';
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`MangaDex API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Error fetching latest manga:', error);
        res.status(500).json({ error: 'Failed to fetch latest manga data' });
    }
});

// Completed manga endpoint
app.get('/manga/completed', async (req, res) => {
    try {
        const url = 'https://api.mangadex.org/manga?limit=12&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&status[]=completed&hasAvailableChapters=true';
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`MangaDex API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Error fetching completed manga:', error);
        res.status(500).json({ error: 'Failed to fetch completed manga data' });
    }
});

// Ongoing manga endpoint
app.get('/manga/ongoing', async (req, res) => {
    try {
        const url = 'https://api.mangadex.org/manga?limit=12&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&status[]=ongoing&hasAvailableChapters=true';
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`MangaDex API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Error fetching ongoing manga:', error);
        res.status(500).json({ error: 'Failed to fetch ongoing manga data' });
    }
});

// Enhanced chapter search endpoint
app.get('/chapters/:mangaId', async (req, res) => {
    try {
        const { mangaId } = req.params;
        const { language = 'en' } = req.query;
        
        const url = `https://api.mangadex.org/chapter?manga=${mangaId}&translatedLanguage[]=${language}&limit=100&order[chapter]=asc`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`MangaDex API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Error fetching chapters:', error);
        res.status(500).json({ error: 'Failed to fetch chapter data' });
    }
});

// Chapter pages endpoint
app.get('/chapter/:chapterId', async (req, res) => {
    try {
        const { chapterId } = req.params;
        
        const url = `https://api.mangadex.org/at-home/server/${chapterId}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`MangaDex API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Error fetching chapter pages:', error);
        res.status(500).json({ error: 'Failed to fetch chapter pages' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`Readrift server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to start reading manga!`);
});
