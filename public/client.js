
// Modern SPA navigation and UI for Readrift
const root = document.body;
let displayDiv;
let currentManga = null;
let currentChapters = [];
let savedManga = JSON.parse(localStorage.getItem('savedManga') || '[]');
let currentPage = 0;
let currentChapterPages = [];

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
    renderHome(); // Start with home page by default
});

function renderNavBar(activeTab = 'home') {
    let nav = document.createElement('nav');
    nav.className = 'main-navbar';
    nav.innerHTML = `
        <span class="logo">Readrift</span>
        <div class="nav-tabs">
            <button class="nav-btn${activeTab==='home'?' active':''}" id="navHome">Home</button>
            <button class="nav-btn${activeTab==='search'?' active':''}" id="navSearch">Search</button>
            <button class="nav-btn${activeTab==='profile'?' active':''}" id="navProfile">Profile</button>
        </div>
    `;
    return nav;
}

function clearRoot() {
    while (root.firstChild) root.removeChild(root.firstChild);
}

// Render the home page with recommendations
async function renderHome() {
    clearRoot();
    root.appendChild(renderNavBar('home'));
    
    let main = document.createElement('main');
    main.className = 'home-main';
    
    // Hero section
    const heroSection = `
        <section class="hero-section">
            <h1 class="hero-title">Discover Amazing Manga</h1>
            <p class="hero-subtitle">Explore thousands of manga titles with high-quality translations and beautiful artwork</p>
            <a href="#" class="hero-cta" id="startReadingBtn">
                <span>Start Reading</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </a>
        </section>
    `;
    
    // Categories section
    const categoriesSection = `
        <section class="categories-section">
            <div class="section-header">
                <div>
                    <h2 class="section-title">Browse Categories</h2>
                    <p class="section-subtitle">Find manga by different categories</p>
                </div>
            </div>
            <div class="categories-grid">
                <div class="category-card" data-category="popular">
                    <div class="category-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </div>
                    <h3 class="category-title">Most Popular</h3>
                    <p class="category-description">Trending manga titles</p>
                </div>
                <div class="category-card" data-category="latest">
                    <div class="category-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                    </div>
                    <h3 class="category-title">Latest Updates</h3>
                    <p class="category-description">Recently updated chapters</p>
                </div>
                <div class="category-card" data-category="completed">
                    <div class="category-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22,4 12,14.01 9,11.01"/>
                        </svg>
                    </div>
                    <h3 class="category-title">Completed</h3>
                    <p class="category-description">Finished manga series</p>
                </div>
                <div class="category-card" data-category="ongoing">
                    <div class="category-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M2 12h20"/>
                        </svg>
                    </div>
                    <h3 class="category-title">Ongoing</h3>
                    <p class="category-description">Currently publishing</p>
                </div>
            </div>
        </section>
    `;
    
    // Recommendations section
    const recommendationsSection = `
        <section class="recommendations-section">
            <div class="section-header">
                <div>
                    <h2 class="section-title">Popular Manga</h2>
                    <p class="section-subtitle">Trending titles you might enjoy</p>
                </div>
                <button class="view-all-btn" id="viewAllBtn">View All</button>
            </div>
            <div class="manga-grid" id="recommendationsGrid">
                <div class="loading">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        </section>
    `;
    
    main.innerHTML = heroSection + categoriesSection + recommendationsSection;
    root.appendChild(main);
    
    // Add event listeners
    attachNavEvents();
    attachHomeEvents();
    
    // Load recommendations
    loadRecommendations();
}

function attachHomeEvents() {
    const startReadingBtn = document.getElementById('startReadingBtn');
    const viewAllBtn = document.getElementById('viewAllBtn');
    
    if (startReadingBtn) {
        startReadingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            renderSearch();
        });
    }
    
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            renderSearch();
        });
    }
    
    // Add category event listeners
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            loadCategoryManga(category);
        });
    });
}

async function loadCategoryManga(category) {
    try {
        let url = '';
        let title = '';
        
        switch(category) {
            case 'popular':
                url = '/manga/popular';
                title = 'Most Popular Manga';
                break;
            case 'latest':
                url = '/manga/latest';
                title = 'Latest Updates';
                break;
            case 'completed':
                url = '/manga/completed';
                title = 'Completed Manga';
                break;
            case 'ongoing':
                url = '/manga/ongoing';
                title = 'Ongoing Manga';
                break;
            default:
                return;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load category manga');
        
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            renderCategoryResults(title, data.data);
        } else {
            alert('No manga found in this category');
        }
    } catch (error) {
        console.error('Error loading category manga:', error);
        alert('Failed to load category manga');
    }
}

function renderCategoryResults(title, mangaList) {
    clearRoot();
    root.appendChild(renderNavBar('search'));
    
    let main = document.createElement('main');
    main.className = 'home-main';
    main.innerHTML = `
        <div class="section-header">
            <div>
                <h2 class="section-title">${title}</h2>
                <p class="section-subtitle">Found ${mangaList.length} manga</p>
            </div>
            <button class="back-btn" onclick="renderHome()">← Back to Home</button>
        </div>
        <div class="manga-grid" id="categoryResults"></div>
    `;
    root.appendChild(main);
    
    const resultsGrid = main.querySelector('#categoryResults');
    renderMangaGrid(mangaList, resultsGrid);
    
    attachNavEvents();
}

async function loadRecommendations() {
    const grid = document.getElementById('recommendationsGrid');
    if (!grid) return;
    
    try {
        // Load popular manga (using trending/popular titles)
        const response = await fetch('/manga/popular');
        if (!response.ok) throw new Error('Failed to load recommendations');
        
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            renderMangaGrid(data.data, grid);
        } else {
            grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No recommendations available</p>';
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Failed to load recommendations</p>';
    }
}

function renderMangaGrid(mangaList, container) {
    container.innerHTML = '';
    
    mangaList.forEach(manga => {
        const title = manga.attributes.title.en || 
                     manga.attributes.title[Object.keys(manga.attributes.title)[0]] || 
                     'Unknown Title';
        const description = manga.attributes.description.en || 
                           manga.attributes.description[Object.keys(manga.attributes.description)[0]] || 
                           'No description available';
        const status = manga.attributes.status || 'Unknown';
        const year = manga.attributes.year || 'Unknown';
        
        // Get cover image - use the correct API format with proper cover art relationship
        const coverRelationship = manga.relationships?.find(r => r.type === 'cover_art');
        let coverUrl = null;
        
        if (coverRelationship) {
            // Use the correct format: https://uploads.mangadex.org/covers/{manga-id}/{cover-id}.{extension}
            const coverId = coverRelationship.id;
            const mangaId = manga.id;
            coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${coverId}.jpg`;
        }
        
        const isSaved = savedManga.some(saved => saved.id === manga.id);
        
        const mangaCard = document.createElement('div');
        mangaCard.className = 'manga-card';
        mangaCard.innerHTML = `
            <div class="manga-cover">
                ${coverUrl ? `<img src="${coverUrl}" alt="${title}" onerror="this.style.display='none'">` : ''}
                <button class="manga-save-btn ${isSaved ? 'saved' : ''}" data-manga-id="${manga.id}" data-saved="${isSaved}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>
            <div class="manga-info">
                <h3 class="manga-title">${title}</h3>
                <div class="manga-meta">
                    <span class="manga-status">${status}</span>
                    <span class="manga-year">${year}</span>
                    <span class="manga-chapters">Chapters: ${manga.attributes.chapterCount || 'Unknown'}</span>
                </div>
                <p class="manga-description">${description.substring(0, 120)}${description.length > 120 ? '...' : ''}</p>
                <div class="manga-actions">
                    <button class="manga-btn btn-primary">Read</button>
                    <button class="manga-btn btn-secondary">Details</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const readBtn = mangaCard.querySelector('.btn-primary');
        const detailsBtn = mangaCard.querySelector('.btn-secondary');
        const saveBtn = mangaCard.querySelector('.manga-save-btn');
        
        readBtn.addEventListener('click', () => {
            currentManga = manga;
            loadMangaChapters(manga.id, title);
        });
        
        detailsBtn.addEventListener('click', () => {
            // Show manga details (could be a modal or new page)
            alert(`Details for ${title} - Coming soon!`);
        });
        
        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSaveManga(manga, saveBtn);
        });
        
        container.appendChild(mangaCard);
    });
}

function toggleSaveManga(manga, saveBtn) {
    const isSaved = savedManga.some(saved => saved.id === manga.id);
    
    if (isSaved) {
        // Remove from saved
        savedManga = savedManga.filter(saved => saved.id !== manga.id);
        saveBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
        `;
        saveBtn.classList.remove('saved');
        saveBtn.setAttribute('data-saved', 'false');
    } else {
        // Add to saved
        savedManga.push({
            id: manga.id,
            title: manga.attributes.title.en || manga.attributes.title[Object.keys(manga.attributes.title)[0]],
            addedAt: new Date().toISOString()
        });
        saveBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
        `;
        saveBtn.classList.add('saved');
        saveBtn.setAttribute('data-saved', 'true');
    }
    
    // Save to localStorage
    localStorage.setItem('savedManga', JSON.stringify(savedManga));
}

function renderSearch() {
    clearRoot();
    root.appendChild(renderNavBar('search'));
    
    let main = document.createElement('main');
    main.className = 'home-main';
    main.innerHTML = `
        <section class="search-section">
            <div class="search-container">
                <input class="search-input" placeholder="Search for manga..." id="searchInput">
                <button class="search-btn" id="searchBtn">Search</button>
            </div>
        </section>
        <div class="displayDiv" id="searchResults"></div>
    `;
    root.appendChild(main);
    
    displayDiv = main.querySelector('#searchResults');
    const searchInput = main.querySelector('#searchInput');
    const searchBtn = main.querySelector('#searchBtn');
    
    // Focus on search input
    setTimeout(() => {
        searchInput.focus();
    }, 100);
    
    // Add event listeners
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBtn.click();
    });
    
    searchBtn.addEventListener('click', async () => {
        await performSearch(searchInput.value.trim());
    });
    
    attachNavEvents();
}

async function performSearch(query) {
    if (!query) {
        displayDiv.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Please enter a search term</p>';
        return;
    }
    
    try {
        displayDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
        
        const response = await fetch(`/manga?title=${encodeURIComponent(query)}&limit=20`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            displayDiv.innerHTML = `
                <div class="no-chapters">
                    <h2>No manga found</h2>
                    <p>Try searching with different keywords or browse our recommendations.</p>
                    <button class="back-btn" onclick="renderHome()">Back to Home</button>
                </div>
            `;
            return;
        }
        
        displayDiv.innerHTML = `
            <div class="section-header">
                <div>
                    <h2 class="section-title">Search Results</h2>
                    <p class="section-subtitle">Found ${data.data.length} manga</p>
                </div>
            </div>
        `;
        
        const resultsGrid = document.createElement('div');
        resultsGrid.className = 'manga-grid';
        displayDiv.appendChild(resultsGrid);
        
        renderMangaGrid(data.data, resultsGrid);
        
    } catch (error) {
        console.error('Search error:', error);
        displayDiv.innerHTML = `
            <div class="error-container">
                <h3>Search Error</h3>
                <p>An error occurred while searching. Please try again.</p>
                <button class="back-btn" onclick="renderSearch()">Try Again</button>
            </div>
        `;
    }
}

function renderProfile() {
    clearRoot();
    root.appendChild(renderNavBar('profile'));
    
    let main = document.createElement('main');
    main.className = 'profile-main';
    main.innerHTML = `
        <div class="profile-card">
            <div class="profile-avatar">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </div>
            <h2 class="profile-username">Guest User</h2>
            <p class="profile-email">Not logged in</p>
            <button class="profile-auth-btn" id="loginBtn">Login / Sign Up</button>
            <button class="profile-auth-btn" id="logoutBtn" style="display:none;">Logout</button>
        </div>
    `;
    root.appendChild(main);
    
    // Add event listeners for auth buttons
    const loginBtn = main.querySelector('#loginBtn');
    const logoutBtn = main.querySelector('#logoutBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'auth.html';
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            alert('Logout functionality coming soon!');
        });
    }
    
    attachNavEvents();
}

function attachNavEvents() {
    const navHome = document.getElementById('navHome');
    const navSearch = document.getElementById('navSearch');
    const navProfile = document.getElementById('navProfile');
    
    if (navHome) navHome.onclick = renderHome;
    if (navSearch) navSearch.onclick = renderSearch;
    if (navProfile) navProfile.onclick = renderProfile;
}

// Load chapters for a specific manga
async function loadMangaChapters(mangaId, mangaTitle) {
    try {
        displayDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
        
        const response = await fetch(`https://api.mangadex.org/chapter?manga=${mangaId}&translatedLanguage[]=en&limit=100&order[chapter]=asc`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch chapters: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            displayDiv.innerHTML = `
                <div class="no-chapters">
                    <h2>No chapters available</h2>
                    <p>This manga doesn't have English translations available.</p>
                    <button class="back-btn" onclick="renderSearch()">← Back to Search</button>
                </div>
            `;
            return;
        }
        
        currentChapters = data.data;
        renderChapterList(mangaTitle);
        
    } catch (error) {
        console.error("Error loading chapters:", error);
        displayDiv.innerHTML = `
            <div class="error-container">
                <h3>Failed to load chapters</h3>
                <p>Error: ${error.message}</p>
                <button class="back-btn" onclick="renderSearch()">← Back to Search</button>
            </div>
        `;
    }
}

// Render the list of chapters for the selected manga
function renderChapterList(mangaTitle) {
    displayDiv.innerHTML = `
        <div class="chapter-list-header">
            <button class="back-btn" onclick="renderSearch()">← Back to Search</button>
            <h2>${mangaTitle}</h2>
            <p>Available Chapters (${currentChapters.length})</p>
        </div>
        <div class="chapters-container"></div>
    `;
    
    const chaptersContainer = displayDiv.querySelector('.chapters-container');
    
    currentChapters.forEach((chapter, index) => {
        const chapterNumber = chapter.attributes.chapter || 'N/A';
        const title = chapter.attributes.title || 'Untitled';
        const volume = chapter.attributes.volume || '';
        const pages = chapter.attributes.pages || 0;
        const publishAt = chapter.attributes.publishAt ? new Date(chapter.attributes.publishAt).toLocaleDateString() : '';

        const chapterCard = document.createElement('div');
        chapterCard.className = 'chapter-card';
        
        chapterCard.innerHTML = `
            <div class="chapter-header">
                <span class="chapter-number">Chapter ${chapterNumber}</span>
                <div class="chapter-meta">
                    ${volume ? `<span class="volume">Vol. ${volume}</span>` : ''}
                    <span class="pages">${pages} pages</span>
                </div>
            </div>
            <div class="chapter-title">${title}</div>
            ${publishAt ? `<div class="chapter-date">Published: ${publishAt}</div>` : ''}
            <div class="manga-actions" style="margin-top: 1rem;">
                <button class="manga-btn btn-primary">Read Chapter</button>
                <button class="manga-btn btn-secondary">Open in Reading Mode</button>
            </div>
        `;
        
        const readBtn = chapterCard.querySelector('.btn-primary');
        const fullscreenBtn = chapterCard.querySelector('.btn-secondary');
        
        readBtn.addEventListener('click', () => {
            readChapter(chapter, chapterNumber, title, mangaTitle);
        });
        
        fullscreenBtn.addEventListener('click', () => {
            readChapterFullscreen(chapter, chapterNumber, title, mangaTitle);
        });
        
        chaptersContainer.appendChild(chapterCard);
    });
}

// Read a specific chapter
async function readChapter(chapter, chapterNumber, chapterTitle, mangaTitle) {
    try {
        displayDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';

        const chapterID = chapter.id;
        const response = await fetch(`https://api.mangadex.org/at-home/server/${chapterID}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load chapter: ${response.status}`);
        }
        
        const chapterInfo = await response.json();

        if (!chapterInfo.baseUrl || !chapterInfo.chapter) {
            throw new Error('Invalid chapter data received');
        }

        const baseUrl = chapterInfo.baseUrl;
        const hash = chapterInfo.chapter.hash;
        const data = chapterInfo.chapter.data;

        if (!data || data.length === 0) {
            throw new Error('No pages found for this chapter');
        }

        // Create header with chapter info and navigation
        displayDiv.innerHTML = `
            <div class="chapter-header-container">
                <div class="chapter-navigation">
                    <button class="back-btn" onclick="renderChapterList('${mangaTitle}')">← Back to Chapters</button>
                    <button class="home-btn" onclick="renderSearch()">🏠 Search</button>
                    <button class="manga-btn btn-primary" onclick="readChapterFullscreen('${chapterID}', '${chapterNumber}', '${chapterTitle}', '${mangaTitle}')">Open in Reading Mode</button>
                </div>
                <div class="chapter-info">
                    <h2>${mangaTitle}</h2>
                    <h3>Chapter ${chapterNumber}</h3>
                    <p>${chapterTitle}</p>
                    <span class="page-count">${data.length} pages</span>
                </div>
            </div>
            <div class="pages-container"></div>
        `;

        const pagesContainer = displayDiv.querySelector('.pages-container');

        // Load pages with error handling
        data.forEach((filename, index) => {
            const imageUrl = `${baseUrl}/data/${hash}/${filename}`;

            const pageContainer = document.createElement('div');
            pageContainer.className = 'page-container';
            
            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';
            pageNumber.textContent = `Page ${index + 1}`;
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = `Manga Page ${index + 1}`;
            img.className = 'manga-page';
            img.loading = 'lazy';
            
            img.onerror = () => {
                pageContainer.innerHTML = `
                    <div class="page-number">Page ${index + 1}</div>
                    <div class="error-page">Failed to load page</div>
                `;
            };
            
            pageContainer.appendChild(pageNumber);
            pageContainer.appendChild(img);
            pagesContainer.appendChild(pageContainer);
        });
        
    } catch (error) {
        console.error("Error loading chapter pages:", error);
        displayDiv.innerHTML = `
            <div class="error-container">
                <h3>Failed to load chapter pages</h3>
                <p>Error: ${error.message}</p>
                <button class="back-btn" onclick="renderChapterList('${mangaTitle}')">← Back to Chapters</button>
                <button class="home-btn" onclick="renderSearch()">🏠 Search</button>
            </div>
        `;
    }
}

// Fullscreen reader function
async function readChapterFullscreen(chapter, chapterNumber, chapterTitle, mangaTitle) {
    try {
        const chapterID = typeof chapter === 'string' ? chapter : chapter.id;
        const response = await fetch(`https://api.mangadex.org/at-home/server/${chapterID}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load chapter: ${response.status}`);
        }
        
        const chapterInfo = await response.json();
        const baseUrl = chapterInfo.baseUrl;
        const hash = chapterInfo.chapter.hash;
        const data = chapterInfo.chapter.data;
        
        if (!data || data.length === 0) {
            throw new Error('No pages found for this chapter');
        }
        
        currentChapterPages = data.map((filename, index) => ({
            url: `${baseUrl}/data/${hash}/${filename}`,
            pageNumber: index + 1
        }));
        
        currentPage = 0;
        showFullscreenReader(mangaTitle, chapterNumber, chapterTitle);
        
    } catch (error) {
        console.error("Error loading chapter for fullscreen:", error);
        alert(`Error: ${error.message}`);
    }
}

function showFullscreenReader(mangaTitle, chapterNumber, chapterTitle) {
    const reader = document.createElement('div');
    reader.className = 'fullscreen-reader';
    reader.innerHTML = `
        <div class="reader-header">
            <div>
                <h3>${mangaTitle} - Chapter ${chapterNumber}</h3>
                <p>${chapterTitle}</p>
            </div>
            <button class="reader-btn" onclick="closeFullscreenReader()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
        <div class="reader-content">
            <img class="reader-page" src="${currentChapterPages[currentPage].url}" alt="Page ${currentPage + 1}">
        </div>
        <div class="reader-nav">
            <button class="reader-btn" onclick="previousPage()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15,18 9,12 15,6"/>
                </svg>
                Previous
            </button>
            <span style="color: white; padding: 0.75rem 1rem;">${currentPage + 1} / ${currentChapterPages.length}</span>
            <button class="reader-btn" onclick="nextPage()">
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,18 15,12 9,6"/>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(reader);
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleReaderKeydown);
}

function closeFullscreenReader() {
    const reader = document.querySelector('.fullscreen-reader');
    if (reader) {
        reader.remove();
        document.removeEventListener('keydown', handleReaderKeydown);
    }
}

function handleReaderKeydown(e) {
    if (e.key === 'ArrowLeft') {
        previousPage();
    } else if (e.key === 'ArrowRight') {
        nextPage();
    } else if (e.key === 'Escape') {
        closeFullscreenReader();
    }
}

function previousPage() {
    if (currentPage > 0) {
        currentPage--;
        updateReaderPage();
    }
}

function nextPage() {
    if (currentPage < currentChapterPages.length - 1) {
        currentPage++;
        updateReaderPage();
    }
}

function updateReaderPage() {
    const pageImg = document.querySelector('.reader-page');
    const pageCounter = document.querySelector('.reader-nav span');
    
    if (pageImg) {
        pageImg.src = currentChapterPages[currentPage].url;
    }
    
    if (pageCounter) {
        pageCounter.textContent = `${currentPage + 1} / ${currentChapterPages.length}`;
    }
}

// Helper function to render chapter list (for navigation)
function renderChapterList(mangaTitle) {
    if (currentManga && currentChapters.length > 0) {
        displayDiv.innerHTML = `
            <div class="chapter-list-header">
                <button class="back-btn" onclick="renderSearch()">← Back to Search</button>
                <h2>${mangaTitle}</h2>
                <p>Available Chapters (${currentChapters.length})</p>
            </div>
            <div class="chapters-container"></div>
        `;
        
        const chaptersContainer = displayDiv.querySelector('.chapters-container');
        
        currentChapters.forEach((chapter, index) => {
            const chapterNumber = chapter.attributes.chapter || 'N/A';
            const title = chapter.attributes.title || 'Untitled';
            const volume = chapter.attributes.volume || '';
            const pages = chapter.attributes.pages || 0;
            const publishAt = chapter.attributes.publishAt ? new Date(chapter.attributes.publishAt).toLocaleDateString() : '';

            const chapterCard = document.createElement('div');
            chapterCard.className = 'chapter-card';
            
            chapterCard.innerHTML = `
                <div class="chapter-header">
                    <span class="chapter-number">Chapter ${chapterNumber}</span>
                    <div class="chapter-meta">
                        ${volume ? `<span class="volume">Vol. ${volume}</span>` : ''}
                        <span class="pages">${pages} pages</span>
                    </div>
                </div>
                <div class="chapter-title">${title}</div>
                ${publishAt ? `<div class="chapter-date">Published: ${publishAt}</div>` : ''}
                <div class="manga-actions" style="margin-top: 1rem;">
                    <button class="manga-btn btn-primary">Read Chapter</button>
                    <button class="manga-btn btn-secondary">Open in Reading Mode</button>
                </div>
            `;
            
            const readBtn = chapterCard.querySelector('.btn-primary');
            const fullscreenBtn = chapterCard.querySelector('.btn-secondary');
            
            readBtn.addEventListener('click', () => {
                readChapter(chapter, chapterNumber, title, mangaTitle);
            });
            
            fullscreenBtn.addEventListener('click', () => {
                readChapterFullscreen(chapter, chapterNumber, title, mangaTitle);
            });
            
            chaptersContainer.appendChild(chapterCard);
        });
    } else {
        renderSearch();
    }
}
