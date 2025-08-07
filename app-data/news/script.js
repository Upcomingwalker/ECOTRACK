const API_KEY = 'pub_344da34dda66428baeba18626914e979';
const BASE_URL = 'https://newsdata.io/api/1';

let allArticles = [];
let bookmarkedArticles = [];
let currentCategory = 'all';
let searchQuery = '';
let isBookmarkView = false;

const breakingStories = document.getElementById('breakingStories');
const featuredSection = document.getElementById('featuredSection');
const newsGrid = document.getElementById('newsGrid');
const searchInput = document.getElementById('searchInput');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');
const bookmarkCount = document.getElementById('bookmarkCount');
const navItems = document.querySelectorAll('.nav-item');
const loadingIndicator = document.getElementById('loadingIndicator');

// Environmental keywords for filtering
const environmentalKeywords = [
    'climate', 'environment', 'green', 'renewable', 'solar', 'wind', 'carbon', 
    'emission', 'pollution', 'sustainability', 'conservation', 'biodiversity',
    'ecosystem', 'deforestation', 'global warming', 'greenhouse gas', 'recycling',
    'clean energy', 'electric vehicle', 'sustainable', 'eco-friendly', 'nature',
    'wildlife', 'forest', 'ocean', 'air quality', 'water pollution', 'plastic',
    'organic', 'renewable energy', 'green technology', 'earth day', 'environmental'
];

document.addEventListener('DOMContentLoaded', function() {
    loadBookmarksFromStorage();
    fetchEnvironmentalNews();
    initializeEventListeners();
    updateBookmarkCount();
});

function initializeEventListeners() {
    modalClose.addEventListener('click', closeArticleModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeArticleModal();
        }
    });

    searchInput.addEventListener('keyup', handleSearch);
    searchInput.addEventListener('input', handleSearch);

    // Add navigation event listeners
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            fetchEnvironmentalNews(currentCategory);
        });
    });

    // Add bookmark and home button listeners
    document.getElementById('bookmarkBtn').addEventListener('click', showBookmarks);
    document.getElementById('homeBtn').addEventListener('click', showHome);
}

function cleanContent(content) {
    if (!content) return 'No content available';
    
    const cleanedContent = content
        .replace(/ONLY AVAILABLE IN PAID PLANS/gi, '')
        .replace(/This content is only available to paid subscribers/gi, '')
        .replace(/Subscribe to read full article/gi, '')
        .replace(/\[.*?\]/g, '')
        .replace(/\(.*?paid.*?\)/gi, '')
        .replace(/upgrade.*?plan/gi, '')
        .replace(/premium.*?content/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (cleanedContent.length < 50) {
        return 'Full article content available at the source. Click "Read Full Article" to continue reading.';
    }
    
    return cleanedContent;
}

function isEnvironmentalNews(article) {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = (article.content || '').toLowerCase();
    
    const textToCheck = `${title} ${description} ${content}`;
    
    return environmentalKeywords.some(keyword => 
        textToCheck.includes(keyword.toLowerCase())
    );
}

async function fetchEnvironmentalNews(category = '') {
    showLoading(true);
    try {
        let searchTerms = '';
        
        // Map categories to environmental search terms
        const categorySearchMap = {
            'climate': 'climate change OR global warming OR greenhouse gas',
            'renewable': 'renewable energy OR solar power OR wind energy OR clean energy',
            'conservation': 'conservation OR biodiversity OR wildlife OR forest',
            'pollution': 'pollution OR waste OR plastic OR air quality',
            'sustainability': 'sustainability OR sustainable OR eco-friendly OR green technology',
            'all': 'environment OR climate OR green OR renewable OR sustainability OR conservation'
        };
        
        searchTerms = categorySearchMap[category] || categorySearchMap['all'];
        
        let url = `${BASE_URL}/news?apikey=${API_KEY}&country=in&language=en&q=${encodeURIComponent(searchTerms)}`;
        
        console.log('Fetching environmental news from:', url);
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newsData = await response.json();
        console.log('API Response:', newsData);
        
        if (newsData.status === 'error') {
            throw new Error(`API Error: ${newsData.message}`);
        }
        
        if (!newsData.results || newsData.results.length === 0) {
            throw new Error('No environmental articles found');
        }

        // Filter articles to ensure they're environmental
        const environmentalArticles = newsData.results.filter(isEnvironmentalNews);
        
        if (environmentalArticles.length === 0) {
            throw new Error('No relevant environmental articles found');
        }

        allArticles = environmentalArticles.map(article => ({
            id: Math.random().toString(36).substr(2, 9),
            title: article.title,
            summary: cleanContent(article.description) || 'No description available',
            content: cleanContent(article.content) || cleanContent(article.description) || 'No content available',
            category: getCategoryFromContent(article) || 'Environmental',
            time: formatTime(article.pubDate),
            image: article.image_url || getEnvironmentalPlaceholderImage(),
            source: article.source_id || 'Environmental Source',
            url: article.link,
            publishedAt: article.pubDate
        }));

        renderBreakingNews();
        renderFeaturedArticle();
        renderNewsGrid();
        
    } catch (error) {
        console.error('Detailed error:', error);
        showError(`Failed to load environmental news: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function getCategoryFromContent(article) {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    
    const text = `${title} ${description}`;
    
    if (text.includes('climate') || text.includes('global warming')) return 'Climate Change';
    if (text.includes('renewable') || text.includes('solar') || text.includes('wind')) return 'Renewable Energy';
    if (text.includes('conservation') || text.includes('wildlife') || text.includes('biodiversity')) return 'Conservation';
    if (text.includes('pollution') || text.includes('waste') || text.includes('plastic')) return 'Pollution';
    if (text.includes('sustainable') || text.includes('green tech')) return 'Sustainability';
    
    return 'Environmental';
}

function getEnvironmentalPlaceholderImage() {
    const images = [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop', // Forest
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop', // Nature
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=250&fit=crop', // Ocean
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop', // Mountains
        'https://images.unsplash.com/photo-1574263867128-e6bbe9b4e18b?w=400&h=250&fit=crop', // Solar panels
        'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=250&fit=crop'  // Wind turbines
    ];
    return images[Math.floor(Math.random() * images.length)];
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
}

function showLoading(show) {
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    newsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--color-text-secondary);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-bottom: 16px; color: var(--color-error);">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <h3 style="margin: 0 0 8px 0; color: var(--color-text);">Unable to Load Environmental News</h3>
            <p style="margin: 0; font-size: 14px;">${message}</p>
            <button onclick="fetchEnvironmentalNews()" style="margin-top: 16px; padding: 8px 16px; background: var(--color-primary); color: white; border: none; border-radius: 8px; cursor: pointer;">
                Try Again
            </button>
        </div>
    `;
}

function renderBreakingNews() {
    if (!breakingStories) return;
    
    const breakingNews = allArticles.slice(0, 3);
    breakingStories.innerHTML = '';
    
    breakingNews.forEach(article => {
        const storyElement = document.createElement('div');
        storyElement.className = 'breaking-story';
        storyElement.innerHTML = `
            <h3>${article.title}</h3>
            <div class="meta">${article.source} • ${article.time}</div>
        `;
        storyElement.addEventListener('click', () => openArticleModal(article));
        breakingStories.appendChild(storyElement);
    });
}

function renderFeaturedArticle() {
    if (!featuredSection || allArticles.length === 0) return;
    
    const featuredArticle = allArticles[0];
    featuredSection.innerHTML = `
        <article class="featured-article" onclick="openArticleModal(${JSON.stringify(featuredArticle).replace(/"/g, '&quot;')})">
            <img src="${featuredArticle.image}" alt="${featuredArticle.title}" class="featured-image" onerror="this.src='${getEnvironmentalPlaceholderImage()}'">
            <div class="featured-content">
                <span class="category-tag">${featuredArticle.category}</span>
                <h2 class="featured-title">${featuredArticle.title}</h2>
                <p class="featured-summary">${featuredArticle.summary}</p>
                <div class="featured-meta">
                    <span>${featuredArticle.source}</span>
                    <span>${featuredArticle.time}</span>
                </div>
            </div>
        </article>
    `;
}

function renderNewsGrid() {
    if (!newsGrid) return;
    
    let articlesToShow = allArticles;
    
    if (isBookmarkView) {
        articlesToShow = bookmarkedArticles;
        if (articlesToShow.length === 0) {
            newsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--color-text-secondary);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-bottom: 16px;">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <h3 style="margin: 0 0 8px 0; color: var(--color-text);">No Bookmarked Articles</h3>
                    <p style="margin: 0; font-size: 14px;">Bookmark environmental articles to read them later!</p>
                </div>
            `;
            return;
        }
    } else {
        articlesToShow = allArticles.slice(1); // Skip featured article
    }
    
    if (searchQuery) {
        articlesToShow = articlesToShow.filter(article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.summary.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (articlesToShow.length === 0) {
            newsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--color-text-secondary);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-bottom: 16px;">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <h3 style="margin: 0 0 8px 0; color: var(--color-text);">No Environmental Articles Found</h3>
                    <p style="margin: 0; font-size: 14px;">Try adjusting your search or category filter.</p>
                </div>
            `;
            return;
        }
    }
    
    newsGrid.innerHTML = '';
    
    articlesToShow.forEach(article => {
        const articleElement = document.createElement('article');
        articleElement.className = 'article-card';
        
        const isBookmarked = bookmarkedArticles.some(bookmark => bookmark.id === article.id);
        
        articleElement.innerHTML = `
            <img src="${article.image}" alt="${article.title}" class="article-image" onerror="this.src='${getEnvironmentalPlaceholderImage()}'">
            <div class="article-content">
                <h3 class="article-title">${article.title}</h3>
                <p class="article-summary">${article.summary}</p>
                <div class="article-meta">
                    <div>
                        <span class="article-source">${article.source}</span> • 
                        <span>${article.time}</span>
                    </div>
                    <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" onclick="event.stopPropagation(); toggleBookmark(${JSON.stringify(article).replace(/"/g, '&quot;')})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        articleElement.addEventListener('click', () => openArticleModal(article));
        newsGrid.appendChild(articleElement);
    });
}

function openArticleModal(article) {
    modalBody.innerHTML = `
        <img src="${article.image}" alt="${article.title}" class="modal-image" onerror="this.src='${getEnvironmentalPlaceholderImage()}'">
        <h1 class="modal-title">${article.title}</h1>
        <div class="modal-meta">
            <span class="category-tag">${article.category}</span>
            <span>${article.source}</span>
            <span>${article.time}</span>
        </div>
        <div class="modal-summary">${article.content}</div>
        ${article.url ? `<a href="${article.url}" target="_blank" class="btn btn--primary" style="margin-top: 20px; display: inline-block;">Read Full Article</a>` : ''}
    `;
    modalOverlay.classList.add('active');
}

function closeArticleModal() {
    modalOverlay.classList.remove('active');
}

function toggleBookmark(article) {
    const existingIndex = bookmarkedArticles.findIndex(bookmark => bookmark.id === article.id);
    
    if (existingIndex > -1) {
        bookmarkedArticles.splice(existingIndex, 1);
    } else {
        bookmarkedArticles.push(article);
    }
    
    saveBookmarksToStorage();
    updateBookmarkCount();
    
    if (isBookmarkView) {
        renderNewsGrid();
    } else {
        // Update bookmark button state
        const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
        bookmarkBtns.forEach(btn => {
            const btnArticleData = btn.getAttribute('onclick');
            if (btnArticleData && btnArticleData.includes(article.id)) {
                btn.classList.toggle('bookmarked');
                const svg = btn.querySelector('svg');
                svg.setAttribute('fill', btn.classList.contains('bookmarked') ? 'currentColor' : 'none');
            }
        });
    }
}

function saveBookmarksToStorage() {
    localStorage.setItem('environmentalNewsBookmarks', JSON.stringify(bookmarkedArticles));
}

function loadBookmarksFromStorage() {
    const saved = localStorage.getItem('environmentalNewsBookmarks');
    if (saved) {
        bookmarkedArticles = JSON.parse(saved);
    }
}

function updateBookmarkCount() {
    if (bookmarkCount) {
        bookmarkCount.textContent = bookmarkedArticles.length;
        bookmarkCount.style.display = bookmarkedArticles.length > 0 ? 'block' : 'none';
    }
}

function showBookmarks() {
    isBookmarkView = true;
    featuredSection.style.display = 'none';
    document.querySelector('.breaking-banner').style.display = 'none';
    
    document.getElementById('bookmarkBtn').classList.add('active');
    document.getElementById('homeBtn').classList.remove('active');
    
    renderNewsGrid();
}

function showHome() {
    isBookmarkView = false;
    featuredSection.style.display = 'block';
    document.querySelector('.breaking-banner').style.display = 'block';
    
    document.getElementById('homeBtn').classList.add('active');
    document.getElementById('bookmarkBtn').classList.remove('active');
    
    renderNewsGrid();
}

function handleSearch() {
    searchQuery = searchInput.value.trim();
    renderNewsGrid();
}

// Initialize the app
function init() {
    fetchEnvironmentalNews();
}
