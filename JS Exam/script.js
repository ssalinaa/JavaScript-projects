// Constants for API and LocalStorage
const API_BASE = 'https://www.omdbapi.com/'; // Base URL for the OMDb API
const API_KEY = '52c14ace'; // API key for accessing the OMDb API
const FAV_KEY = 'movie_favorites'; // Key for storing favorite movies in localStorage

// Application state
const state = {
  query: '',            // Current search query
  page: 1,              // Current page for pagination
  totalResults: 0,      // Total number of results from the search
  results: [],          // Array holding the results of the current search
  favorites: {},        // Object storing favorite movies, keyed by imdbID
};

// Cached DOM elements
const elements = {
  searchInput: document.getElementById('searchInput'),
  searchButton: document.getElementById('searchButton'),
  loadMoreButton: document.getElementById('loadMoreButton'),
  tabResults: document.getElementById('tabResults'),
  tabFavorites: document.getElementById('tabFavorites'),
  statusBar: document.getElementById('statusBar'),
  resultsSection: document.getElementById('resultsSection'),
  resultsGrid: document.getElementById('resultsGrid'),
  favoritesSection: document.getElementById('favoritesSection'),
  clearFavoritesButton: document.getElementById('clearFavoritesButton'),
  favoritesGrid: document.getElementById('favoritesGrid'),
  favoritesQuickViewList: document.getElementById('favoritesQuickViewList'),
  modalRoot: document.getElementById('modalRoot'),
};

const movieCardElement = {
  movieCard: document.getElementById('movieCard'),
};

// API Functions
/**
 * Performs fetch request with retry logic.
 * @param {string} url - API URL
 * @param {object} options - fetch options
 * @param {number} retries - number of retries
 * @param {number} backoff - delay between retries
 * @returns {Promise<object>} JSON response
*/

async function fetchWithRetry(url, options = {}, retries = 2, backoff = 400) {
  try {
    const res = await fetch(url, { ...options });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
}

/**
 * Searches movies from OMDb API by title.
 * @param {string} q - Search query
 * @param {number} page - Page number
 * @returns {Promise<object>} API response
*/

async function searchMoviesAPI(q, page = 1) {
  const url = `${API_BASE}?apikey=${API_KEY}&type=movie&s=${encodeURIComponent(q)}&page=${page}`;
  const data = await fetchWithRetry(url);
  if (data.Response === 'False') return { Search: [], totalResults: 0, Error: data.Error };
  return data;
}

/**
 * Fetches detailed info for a movie by IMDb ID.
 * @param {string} id - IMDb ID
 * @returns {Promise<object>} API response
*/

async function getMovieByIdAPI(id) {
  const url = `${API_BASE}?apikey=${API_KEY}&plot=full&i=${encodeURIComponent(id)}`;
  return fetchWithRetry(url);
}

// Favorites Management
// Loads favorites from localStorage into state.
function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    state.favorites = raw ? JSON.parse(raw) : {};
  } catch {
    state.favorites = {};
  }
}

// Saves favorites from state into localStorage and updates UI.
function saveFavorites() {
  localStorage.setItem(FAV_KEY, JSON.stringify(state.favorites));
  renderFavoritesGrid();
  renderFavoritesQuickViewList();
  document.querySelectorAll('[data-imdbid]').forEach(element => {
    const id = element.getAttribute('data-imdbid');
    const button = element.querySelector('button[data-action="toggle-favorite"]');
    if (button) updateFavoriteButton(button, !!state.favorites[id]);
  });
}

// Clears all favorites from state and UI.
function clearFavorites() {
  state.favorites = {};
  saveFavorites(); 
  setStatus('All favorite movies have been removed.', 'info');
}

if (elements.clearFavoritesButton) {
  elements.clearFavoritesButton.addEventListener('click', clearFavorites);
}

/**
 * Toggles favorite status for a movie.
 * @param {object} movie - Movie object
*/

function toggleFavorite(movie) {
  if (!movie || !movie.imdbID) return;
  if (state.favorites[movie.imdbID]) delete state.favorites[movie.imdbID];
  else state.favorites[movie.imdbID] = movie;
  saveFavorites();
}

// UI Helpers
/**
 * Displays a status message or hides it.
 * @param {string} message - Message text
 * @param {string} type - 'info' or 'error'
*/

function setStatus(message, type = 'info') {
  const bar = elements.statusBar;
  if (!message) { bar.classList.add('hidden'); bar.textContent=''; return; }
  bar.className = 'status-bar ' + (type === 'error' ? 'error' : 'info');
  bar.textContent = message;
  bar.classList.remove('hidden');
}

/**
 * Returns a poster URL or placeholder if not available.
 * @param {string} src - Poster URL
 * @returns {string} Valid image URL
*/

function moviePoster(src) {
  if (!src || src === 'N/A') return 'https://placehold.co/300x450?text=No+Poster';
  return src;
}

/**
 * Updates Add/Remove Favorite button style and text.
 * @param {HTMLElement} button - Button element
 * @param {boolean} isFavorite - True if movie is favorite
*/

function updateFavoriteButton(button, isFavorite) {
  button.textContent = isFavorite ? 'Remove' : 'Add to favorites';
  button.classList.toggle('add-favorite', !isFavorite);
  button.classList.toggle('remove-favorite', isFavorite);
}

// Rendering Functions
/**
 * Creates a movie card element from movie data.
 * @param {object} movie - Movie object
 * @returns {HTMLElement} Movie card element
*/

function createMovieCard(movie) {
  const node = movieCardElement.movieCard.content.firstElementChild.cloneNode(true);
  node.setAttribute('data-imdbid', movie.imdbID);
  node.querySelector('img').src = moviePoster(movie.Poster);
  node.querySelector('h3').textContent = movie.Title;
  node.querySelector('span').textContent = movie.Year;

  node.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    showDetailsModal(movie.imdbID);
  });

  const detailsButton = node.querySelector('button[data-action="details"]');
  detailsButton.addEventListener('click', (e) => { e.stopPropagation(); showDetailsModal(movie.imdbID); });

  const favoritesButton = node.querySelector('button[data-action="toggle-favorite"]');
  updateFavoriteButton(favoritesButton, !!state.favorites[movie.imdbID]);
  favoritesButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(movie);
    updateFavoriteButton(favoritesButton, !!state.favorites[movie.imdbID]);
  });

  return node;
}

/**
 * Renders search results into the grid.
 * @param {boolean} append - If true, appends results; else replaces
*/

function renderResults(append = false) {
  if (!append) elements.resultsGrid.innerHTML = '';
  const fragment = document.createDocumentFragment();
  state.results.forEach(m => fragment.appendChild(createMovieCard(m)));
  elements.resultsGrid.appendChild(fragment);
}

/**
 * Renders favorite movies grid.
*/

function renderFavoritesGrid() {
  elements.favoritesGrid.innerHTML = '';
  const ids = Object.keys(state.favorites);
  if (ids.length === 0) {
    elements.favoritesGrid.innerHTML = '<p class="empty-message">No favourite movies.</p>';
    return;
  }
  const fragment = document.createDocumentFragment();
  ids.forEach(id => {
    fragment.appendChild(createMovieCard(state.favorites[id]));
  });
  elements.favoritesGrid.appendChild(fragment);
}

/**
 * Renders quick view list of up to 5 favorite movies.
*/

function renderFavoritesQuickViewList() {
  const ids = Object.keys(state.favorites);
  elements.favoritesQuickViewList.innerHTML = '';
  if (ids.length === 0) {
    elements.favoritesQuickViewList.innerHTML = '<li class="empty-message-quick-view">No favourite movies.</li>';
    return;
  }
  const limitedIds = ids.slice(0, 5);
  const fragment = document.createDocumentFragment();
  limitedIds.forEach(id => {
    const movie = state.favorites[id];
    const li = document.createElement('li');
    li.className = 'quick-view-list-item';
    li.innerHTML = `
      <img src="${moviePoster(movie.Poster)}" alt="Poster" class="quick-view-list-poster" />
      <div class="quick-view-item-details">
        <p class="quick-view-item-title">${movie.Title}</p>
        <p class="quick-view-item-year">${movie.Year}</p>
      </div>
      <button data-imdbid="${movie.imdbID}" class="action-button remove-favorite-quick-view-button">Remove</button>
    `;
    fragment.appendChild(li);
  });
  elements.favoritesQuickViewList.appendChild(fragment);
}

// Modal Functions
/**
 * Closes the modal window.
*/

function closeModal() {
  elements.modalRoot.classList.add('hidden');
  elements.modalRoot.innerHTML = '';
  document.body.classList.remove('no-scroll');
}

/**
 * Shows a modal with movie details.
 * @param {string} imdbID - IMDb ID of movie
*/

async function showDetailsModal(imdbID) {
  try {
    setStatus('Load details…');
    const data = await getMovieByIdAPI(imdbID);
    setStatus('');

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    const panel = document.createElement('div');
    panel.className = 'modal-panel';

    const header = document.createElement('div');
    header.className = 'modal-header';
    const title = document.createElement('h3');
    title.className = 'modal-title';
    title.textContent = `${data.Title} (${data.Year})`;
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close-button';
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', closeModal);
    header.append(title, closeButton);

    const body = document.createElement('div');
    body.className = 'modal-body';
    const poster = document.createElement('img');
    poster.src = moviePoster(data.Poster);
    poster.alt = 'Poster';
    poster.className = 'modal-poster';

    const info = document.createElement('div');
    info.innerHTML = `
      <div class="modal-meta">
        <span>${data.Rated || 'NR'}</span>
        <span>${data.Runtime || ''}</span>
        <span>${data.Genre || ''}</span>
        <span>${data.Released || ''}</span>
      </div>
      <p class="modal-plot">${data.Plot || ''}</p>
      <div class="modal-info-grid">
        <div><span class="info-label">Director:</span> ${data.Director}</div>
        <div><span class="info-label">Actors:</span> ${data.Actors}</div>
        <div><span class="info-label">Language:</span> ${data.Language}</div>
        <div><span class="info-label">IMDb:</span> ${data.imdbRating} • Votes: ${data.imdbVotes}</div>
        <div><span class="info-label">BoxOffice:</span> ${data.BoxOffice || '—'}</div>
        <div><span class="info-label">Type:</span> ${data.Type}</div>
      </div>
    `;
    body.append(poster, info);
    panel.append(header, body);
    overlay.appendChild(panel);

    elements.modalRoot.innerHTML = '';
    elements.modalRoot.appendChild(overlay);
    elements.modalRoot.classList.remove('hidden');
    document.body.classList.add('no-scroll');
  } catch (err) {
    setStatus('Error while loading details: ' + err.message, 'error');
  }
}

// Search Functions
/**
 * Performs movie search and renders results.
 * @param {boolean} newQuery - If true, starts a new search
*/

async function doSearch(newQuery = false) {
  const q = elements.searchInput.value.trim();
  if (!q) return setStatus('Input text for search.', 'error');

  if (newQuery) {
    state.query = q;
    state.page = 1;
    state.results = [];
    elements.resultsGrid.innerHTML = '';
  }

  setStatus('Searching movies…');
  elements.loadMoreButton.disabled = true;

  try {
    const data = await searchMoviesAPI(state.query, state.page);
    if (data.Error) return setStatus(data.Error, 'error');

    state.results = state.results.concat(data.Search || []);
    state.totalResults = parseInt(data.totalResults || '0', 10);

    renderResults(true);
    setStatus(`Showed ${state.results.length} of ${state.totalResults} results`);
    elements.loadMoreButton.disabled = state.results.length >= state.totalResults;
    state.page++;
  } catch (err) {
    setStatus('Error while searching: ' + err.message, 'error');
  }
}

// Tab Management
/**
 * Switches between Results and Favorites tabs.
 * @param {string} tab - 'results' or 'favorites'
*/

function switchTab(tab) {
  if (tab === 'results') {
    elements.resultsSection.classList.remove('hidden');
    elements.favoritesSection.classList.add('hidden');
    elements.tabResults.classList.add('active');
    elements.tabFavorites.classList.remove('active');
  } else {
    elements.resultsSection.classList.add('hidden');
    elements.favoritesSection.classList.remove('hidden');
    elements.tabFavorites.classList.add('active');
    elements.tabResults.classList.remove('active');
  }
}

// Event Listeners
elements.searchButton.addEventListener('click', () => doSearch(true));
elements.loadMoreButton.addEventListener('click', () => doSearch(false));
elements.searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') doSearch(true); });

elements.tabResults.addEventListener('click', () => switchTab('results'));
elements.tabFavorites.addEventListener('click', () => { 
  loadFavorites(); 
  renderFavoritesGrid();
  switchTab('favorites'); 
});

elements.favoritesQuickViewList.addEventListener('click', (e) => {
  const button = e.target.closest('.remove-favorite-quick-view-button');
  if (button) {
    const imdbID = button.getAttribute('data-imdbid');
    const movie = state.favorites[imdbID];
    if (movie) toggleFavorite(movie);
  }
});

// Initial Load
loadFavorites();
renderFavoritesQuickViewList();