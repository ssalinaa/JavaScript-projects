Interactive Movie Library – Документация

Описание
Този проект е уеб приложение, което позволява на потребителите да търсят филми чрез публичен REST API (OMDb API), 
да разглеждат детайли за тях и да управляват списък с любими филми, съхранявани локално (localStorage).

Приложението демонстрира умения в:
DOM манипулация – създаване и обновяване на HTML елементи динамично.
Събития – обработка на кликове и клавишни събития.
Async/await и промиси – за асинхронни HTTP заявки.
UI/UX – динамично обновяване на интерфейса без презареждане.
Локално съхранение – favorites list.

Структура на проекта
/project-root
│
├─ index.html       # HTML структура на приложението
├─ style.css        # Стилове за layout, grid, модални прозорци и responsiveness
├─ script.js        # JS логика за API, рендериране, събития и favorites
└─ README.md        # Тази документация

HTML структура
Header
Лого и заглавие.
Search bar с input и бутон Search.
Load More бутон за pagination.
Clear Favorites бутон.

Tabs
Results
Favorites

Main Content Grid
Резултати и Favorites секции (grid layout).
Quick View за favorites.

Modal Root
Динамично създаден модален прозорец за детайли на филми.

Template
<template id="movieCard"> – шаблон за рендериране на филмова карта.

CSS структура
Основни стилове: фон, цветове, шрифтове, spacing.
Buttons: clear, search, load, tab buttons.
Grid Layout: за резултати и favorites.
Modal: overlay, panel, header, body, responsive дизайн.
Responsive media queries: адаптивен дизайн за различни ширини на екрана.

JS структура и функции
1. Константи

const API_BASE = 'https://www.omdbapi.com/';
const API_KEY = '52c14ace'; 
const FAV_KEY = 'movie_favorites';

API_BASE и API_KEY за OMDb.
FAV_KEY – ключ за localStorage за favorites.

2. State обект

const state = {
  query: '',
  page: 1,
  totalResults: 0,
  results: [],
  favorites: {},
};

query – текущо търсене.
page – за pagination.
totalResults – общ брой резултати.
results – текущи резултати.
favorites – обект с любими филми, ключ imdbID.

3. DOM елементи (elements)

Кеширане на DOM елементи за лесен достъп:
searchInput, searchBtn, loadMoreBtn, tabResults, tabFavorites, resultsSection, favoritesSection, etc.

4. Основни функции

fetchWithRetry(url, options, retries, backoff)
Асинхронна fetch заявка с retry логика при грешка.

searchMoviesAPI(q, page)
Търсене на филми по заглавие чрез OMDb API.

getMovieByIdAPI(id)
Взема детайли на филм по imdbID.

loadFavorites() / saveFavorites() / clearFavorites()
Четене и запис на favorites в localStorage.
Обновяване на UI при промяна.

toggleFavorite(movie)
Добавя или премахва филм от favorites и обновява UI.

setStatus(message, type)
Показва статус или грешка над results grid.

moviePoster(src)
Връща постер или placeholder, ако няма.

updateFavButton(btn, isFav)
Обновява текст и стил на бутона Add/Remove Favorite.

createMovieCard(movie)
Създава филмова карта с event listeners за детайли и favorite.

renderResults(append)
Рендерира резултатите от търсенето.

renderFavoritesGrid() / renderFavoritesQuickList()
Рендерира любимите филми в пълен grid и quick view.

showDetailsModal(imdbID)
Динамично създава модален прозорец с детайли за филма.

doSearch(newQuery)
Стартира търсене, обновява state и UI.

switchTab(tab)
Превключва между Results и Favorites секциите.

5. Събития

Search бутон и Enter – doSearch(true)
Load More бутон – doSearch(false)
Tabs – switchTab('results') / switchTab('favorites')
Clear Favorites бутон – clearFavorites()
Quick View – премахване на favorite от списъка

6. Design pattern

Module pattern: JS кодът е структуриран като набор от функции, които манипулират state и DOM, като public API са event handlers и render функции.

7. Error handling

Проверка на празен input.
Статус при грешка от API.
Retry логика за fetch.

8. Bonus

Quick View на до 5 любимите филми.
Responsive design за различни размери на екрана.

9. Примерен flow

Потребителят въвежда заглавие → fetch от OMDb → render cards.
Клик на “Details” → показва модален прозорец с детайли.
Клик на “Add to Favorites” → добавя към localStorage.
Клик на “Favorites” таб → render всички запазени favorites.
Премахване на favorite → обновява UI и localStorage.