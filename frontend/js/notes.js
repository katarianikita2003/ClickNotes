// API Base URL
const API_URL = 'http://localhost:5000/api';

// Load notes
async function loadNotes(page = 1, filters = {}) {
    try {
        const queryParams = new URLSearchParams({
            page,
            limit: 12,
            ...filters
        });

        const response = await fetch(`${API_URL}/notes?${queryParams}`, {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            displayNotes(data.notes);
            updatePagination(data.currentPage, data.totalPages);
        }
    } catch (error) {
        console.error('Load notes error:', error);
    }
}

// Display notes
function displayNotes(notes) {
    const notesContainer = document.querySelector('.home-notes');
    if (!notesContainer) return;

    const notesHTML = notes.map(note => `
        <div class="home-note max-width-1 m-auto">
            <div class="home-note-img">
                <img src="${note.thumbnailUrl || '/img/default-note.jpg'}" alt="${note.title}">
            </div>
            <div class="home-note-content">
                <a href="note_view.html?id=${note._id}">
                    <h3>${note.title}</h3>
                </a>
                <span>${note.subject} | ${note.class}</span>
                <span>${formatDate(note.createdAt)} | ${note.readingTime}</span>
                <span>by ${note.uploadedBy.firstName} ${note.uploadedBy.lastName}</span>
            </div>
        </div>
    `).join('');

    // Keep the heading
    const heading = notesContainer.querySelector('h3');
    notesContainer.innerHTML = '';
    if (heading) notesContainer.appendChild(heading);
    notesContainer.innerHTML += notesHTML;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'long' };
    return date.toLocaleDateString('en-US', options);
}

// Update pagination
function updatePagination(currentPage, totalPages) {
    // Add pagination UI if needed
}

// Upload note
async function uploadNote(event) {
    event.preventDefault();

    const user = await checkAuth();
    if (!user) {
        alert('Please login to upload notes');
        window.location.href = 'Notes.html';
        return;
    }

    const formData = new FormData();
    formData.append('title', document.querySelector('input[placeholder="Topic Name"]').value);
    formData.append('subject', prompt('Enter subject (e.g., Physics, Chemistry):'));
    formData.append('class', document.querySelector('input[placeholder="Enter Your Class"]').value);
    formData.append('unit', prompt('Enter unit (e.g., Unit 1, Unit 2):'));
    formData.append('description', prompt('Enter a brief description:'));
    formData.append('content', prompt('Enter the main content (minimum 50 characters):'));
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt,.ppt,.pptx';
    
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            formData.append('file', file);

            try {
                const response = await fetch(`${API_URL}/notes/upload`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Note uploaded successfully!');
                    window.location.href = 'submit.html';
                } else {
                    if (data.errors) {
                        alert(data.errors.map(e => e.msg).join('\n'));
                    } else {
                        alert(data.error || 'Upload failed');
                    }
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert('Upload failed. Please try again.');
            }
        }
    };

    fileInput.click();
}

// Download note
async function downloadNote(noteId) {
    const user = await checkAuth();
    if (!user) {
        alert('Please login to download notes');
        window.location.href = 'Notes.html';
        return;
    }

    try {
        window.location.href = `${API_URL}/notes/${noteId}/download`;
    } catch (error) {
        console.error('Download error:', error);
        alert('Download failed. Please try again.');
    }
}

// Search notes
async function searchNotes(event) {
    event.preventDefault();
    
    const searchInput = document.querySelector('#search');
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a search query');
        return;
    }

    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
}

// Load search results
async function loadSearchResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (!query) return;

    try {
        const response = await fetch(`${API_URL}/notes/search?q=${encodeURIComponent(query)}`, {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            displaySearchResults(data.notes, query, data.searchTime);
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Display search results
function displaySearchResults(notes, query, searchTime) {
    const container = document.querySelector('.home-notes');
    if (!container) return;

    const heading = container.querySelector('h3');
    if (heading) {
        const time = ((new Date().getTime() - searchTime) / 1000).toFixed(2);
        heading.textContent = `Search Results for "${query}" (${time} seconds)`;
    }

    displayNotes(notes);
}

// Like note
async function likeNote(noteId) {
    const user = await checkAuth();
    if (!user) {
        alert('Please login to like notes');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/notes/${noteId}/like`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            updateLikeButton(noteId, data.liked, data.likesCount);
        }
    } catch (error) {
        console.error('Like error:', error);
    }
}

// Update like button
function updateLikeButton(noteId, liked, count) {
    const likeBtn = document.querySelector(`[data-note-id="${noteId}"] .like-btn`);
    if (likeBtn) {
        likeBtn.classList.toggle('liked', liked);
        likeBtn.textContent = `${liked ? 'Unlike' : 'Like'} (${count})`;
    }
}

// Initialize notes functionality
document.addEventListener('DOMContentLoaded', () => {
    // Load notes on home page
    if (window.location.pathname.includes('Notes.html') || window.location.pathname === '/') {
        loadNotes();
    }

    // Load search results on search page
    if (window.location.pathname.includes('search.html')) {
        loadSearchResults();
    }

    // Add search form listener
    const searchForm = document.querySelector('.nav-right form');
    if (searchForm) {
        searchForm.addEventListener('submit', searchNotes);
    }

    // Add upload form listener
    const uploadBtn = document.querySelector('.sub button.ver[onclick*="Upload"]');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', uploadNote);
    }
});