//for extracting news
const API_KEY = "e1a7d12d12304f52b2f60c157355e6e0";
const url = "https://newsapi.org/v2/everything?q=";

window.addEventListener("load", () => {
    fetchNews("India");
    checkTheme(); // Check and apply saved theme on load
});

//for page reloading
function reload() {
    window.location.reload();
}

//for theme toggle
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

async function fetchNews(query) {
    const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
    const data = await res.json();
    bindData(data.articles);
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    articles.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

//bookmarking
function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");
    const bookmarkButton = cardClone.querySelector(".bookmark-button");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });
    newsSource.innerHTML = `${article.source.name} · ${date}`;

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });

    // Bookmark functionality: Toggle and save bookmark
    bookmarkButton.addEventListener("click", () => {
        toggleBookmark(bookmarkButton, article);
    });

    //if the article is already bookmarked and update the button state
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    const isBookmarked = bookmarks.some((item) => item.url === article.url);

    if (isBookmarked) {
        bookmarkButton.classList.add('bookmarked');
        bookmarkButton.textContent = '✅ Bookmarked';
    }
}

//to handle bookmarking
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
    fetchNews(id);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    const query = searchText.value;
    if (!query) return;
    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});

function viewBookmarks() {
    document.getElementById("cards-container").style.display = "none";
    document.getElementById("bookmarks-container").style.display = "block";
    
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    bindDataToBookmarks(bookmarks);
}

function bindDataToBookmarks(bookmarks) {
    const bookmarkedCardsContainer = document.getElementById("bookmarked-cards-container");
    bookmarkedCardsContainer.innerHTML = ""; // Clear existing bookmarks

    if (bookmarks.length === 0) {
        bookmarkedCardsContainer.innerHTML = "<p>No bookmarks found.</p>";
        return;
    }

    bookmarks.forEach((article) => {
        const cardClone = createBookmarkCard(article);
        bookmarkedCardsContainer.appendChild(cardClone);
    });
}

function createBookmarkCard(article) {
    const card = document.createElement("div");
    card.classList.add("card");
    
    const cardHeader = document.createElement("div");
    cardHeader.classList.add("card-header");

    const img = document.createElement("img");
    img.src = article.urlToImage;
    img.alt = "news-image";

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    const title = document.createElement("h3");
    title.textContent = article.title;

    const source = document.createElement("h6");
    source.classList.add("news-source");
    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });
    source.textContent = `${article.source.name} · ${date}`;

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



