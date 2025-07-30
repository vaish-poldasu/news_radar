// For extracting news
const url = "https://newsapi.org/v2/everything?q=";

window.addEventListener("load", () => {
    fetchNews("India");
    checkTheme(); // Apply saved theme on load
});

// For page reloading
function reload() {
    window.location.reload();
}

// Theme toggle
document.getElementById("themeToggle").addEventListener("click", toggleTheme);
function toggleTheme() {
    const body = document.body;
    body.classList.toggle("dark-mode");
    const isDarkMode = body.classList.contains("dark-mode");
    document.getElementById("themeToggle").textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
}

function checkTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        document.getElementById("themeToggle").textContent = "☀️ Light Mode";
    }
}

// Fetch news using Netlify serverless function proxy
async function fetchNews(query) {
    try {
        const res = await fetch(`/.netlify/functions/fetchNews?q=${query}`);
        const data = await res.json();
        console.log("Fetched articles count:", data.articles?.length);
        bindData(data.articles);
    } catch (e) {
        console.error('Fetch news error:', e);
        document.getElementById("cards-container").innerHTML = "<p>Failed to fetch news. Please try later.</p>";
    }
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    if (!articles || articles.length === 0) {
        cardsContainer.innerHTML = "<p>No news articles found.</p>";
        return;
    }

    articles.forEach((article) => {
        // Use fallback image if the article has no image
        if (!article.urlToImage) {
            article.urlToImage = "default-news-image.png"; // Provide a path to your default placeholder image
        }
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

// Fill data in cloned card template
function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector(".news-img");
    const newsTitle = cardClone.querySelector(".news-title");
    const newsSource = cardClone.querySelector(".news-source");
    const newsDesc = cardClone.querySelector(".news-desc");
    const bookmarkButton = cardClone.querySelector(".bookmark-button");

    newsImg.src = article.urlToImage;
    newsImg.alt = article.title || "News Image";
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });
    newsSource.innerHTML = `${article.source.name} · ${date}`;

    // Open full article in new tab on card click (excluding bookmark button)
    cardClone.firstElementChild.addEventListener("click", (e) => {
        if (!e.target.classList.contains("bookmark-button")) {
            window.open(article.url, "_blank");
        }
    });

    // Bookmark toggle
    bookmarkButton.addEventListener("click", (e) => {
        e.stopPropagation();  // Prevent card click opening article
        toggleBookmark(bookmarkButton, article);
    });

    // Set bookmark button initial state
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    const isBookmarked = bookmarks.some((item) => item.url === article.url);

    if (isBookmarked) {
        bookmarkButton.classList.add('bookmarked');
        bookmarkButton.textContent = '✅ Bookmarked';
    } else {
        bookmarkButton.classList.remove('bookmarked');
        bookmarkButton.textContent = '🔖 Bookmark';
    }
}

// Bookmark toggle function
function toggleBookmark(button, article) {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

    if (button.classList.contains('bookmarked')) {
        // Remove from bookmarks
        bookmarks = bookmarks.filter((item) => item.url !== article.url);
        button.classList.remove('bookmarked');
        button.textContent = '🔖 Bookmark';
    } else {
        // Add to bookmarks
        bookmarks.push(article);
        button.classList.add('bookmarked');
        button.textContent = '✅ Bookmarked';
    }

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

let curSelectedNav = null;
function onNavItemClick(id) {
    // Show news, hide bookmarks on any nav click
    document.getElementById("cards-container").style.display = "flex";
    document.getElementById("bookmarks-container").style.display = "none";

    fetchNews(id);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    const query = searchText.value.trim();
    if (!query) return;

    // Show news, hide bookmarks on search
    document.getElementById("cards-container").style.display = "flex";
    document.getElementById("bookmarks-container").style.display = "none";

    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});

// Show bookmarks view
function viewBookmarks() {
    document.getElementById("cards-container").style.display = "none";
    document.getElementById("bookmarks-container").style.display = "block";

    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    bindDataToBookmarks(bookmarks);
}

// Bind bookmarks to bookmark view container
function bindDataToBookmarks(bookmarks) {
    const bookmarkedCardsContainer = document.getElementById("bookmarked-cards-container");
    bookmarkedCardsContainer.innerHTML = ""; // Clear existing

    if (bookmarks.length === 0) {
        bookmarkedCardsContainer.innerHTML = "<p>No bookmarks found.</p>";
        return;
    }

    bookmarks.forEach((article) => {
        const card = createBookmarkCard(article);
        bookmarkedCardsContainer.appendChild(card);
    });
}

// Create bookmark card DOM element from article object
function createBookmarkCard(article) {
    const card = document.createElement("div");
    card.classList.add("card");

    const cardHeader = document.createElement("div");
    cardHeader.classList.add("card-header");

    const img = document.createElement("img");
    img.src = article.urlToImage || "default-news-image.png";
    img.alt = article.title || "News Image";

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    const title = document.createElement("h3");
    title.textContent = article.title;

    const source = document.createElement("h6");
    source.classList.add("news-source");
    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });
    source.textContent = `${article.source?.name || 'Unknown'} · ${date}`;

    const desc = document.createElement("p");
    desc.classList.add("news-desc");
    desc.textContent = article.description;

    cardHeader.appendChild(img);
    cardContent.appendChild(title);
    cardContent.appendChild(source);
    cardContent.appendChild(desc);

    card.appendChild(cardHeader);
    card.appendChild(cardContent);

    card.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });

    return card;
}
