// Helper function to get quotes from the server
async function fetchQuotes() {
    const response = await fetch('/quotes');
    return response.json();
}

// Helper function to get a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
}

// Helper function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

// Function to render quotes in the list
function renderQuotes(quotes) {
    const quoteList = document.getElementById('quote-list');
    quoteList.innerHTML = '';

    quotes.forEach((quote) => {
        const listItem = document.createElement('li');
        listItem.setAttribute('data-id', quote.id);
        listItem.innerHTML = `
            <div class="quote-text">"${quote.text}"</div>
            <div class="quote-author">- ${quote.author}</div>
            <button class="upvote-button" onclick="upvoteQuote('${quote.id}')">
                👍 <span class="upvote-count">${quote.upvotes}</span>
            </button>
        `;
        quoteList.appendChild(listItem);
    });
}

// Function to sort and display quotes based on the selected filter
async function loadQuotes(filter) {
    const quotes = await fetchQuotes();

    if (filter === 'top-voted') {
        quotes.sort((a, b) => b.upvotes - a.upvotes);
    } else if (filter === 'newest') {
        quotes.reverse(); // Newest quotes first
    }

    renderQuotes(quotes);
}

// Upvote function using UUID for tracking
async function upvoteQuote(id) {
    const upvotedQuotes = getCookie('upvotedQuotes') ? getCookie('upvotedQuotes').split(',') : [];

    // Check if the user has already upvoted this quote
    if (upvotedQuotes.includes(id)) {
        alert("You have already upvoted this quote.");
        return;
    }

    try {
        const response = await fetch('/upvote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });

        if (response.ok) {
            const data = await response.json();
            // Update the upvote count in the UI
            document.querySelector(`[data-id='${id}'] .upvote-count`).textContent = data.upvotes;

            // Add the quote ID to the list of upvoted quotes in the cookie
            upvotedQuotes.push(id);
            setCookie('upvotedQuotes', upvotedQuotes.join(','), 30); // Cookie expires in 30 days
        } else {
            alert("Failed to upvote quote");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while upvoting");
    }
}

// Event listeners for filter buttons
let currentFilter = 'newest';

document.getElementById('filter-newest').addEventListener('click', () => {
    currentFilter = 'newest';
    loadQuotes('newest');
    document.getElementById('filter-newest').classList.add('active');
    document.getElementById('filter-top-voted').classList.remove('active');
});

document.getElementById('filter-top-voted').addEventListener('click', () => {
    currentFilter = 'top-voted';
    loadQuotes('top-voted');
    document.getElementById('filter-top-voted').classList.add('active');
    document.getElementById('filter-newest').classList.remove('active');
});

// Initial load
loadQuotes(currentFilter);
