// Конфигурация
const API_URL = 'https://incubator-2025.onrender.com/api'; // Определить базовый URL для бэкенд API

// Переменные состояния
let currentTopicId = null;
let currentCards = [];
let currentCardIndex = 0;
let currentDisplayedCard = null; // Хранить текущий видимый объект карточки
let progress = { knownCount: 0, unknownCount: 0 }; // Добавить переменную состояния прогресса обратно

// Элементы DOM - Основные контейнеры
const welcomeContainer = document.getElementById('welcome-container');
const flashcardContainer = document.getElementById('flashcard-container');
const progressContainer = document.getElementById('progress-container');

// Элементы DOM - Темы
const topicsList = document.getElementById('topics-list');
const addTopicBtn = document.getElementById('add-topic-btn');
const welcomeAddTopicBtn = document.getElementById('welcome-add-topic');

// Элементы DOM - Модальное окно темы
const addTopicModal = document.getElementById('add-topic-modal');
const addTopicForm = document.getElementById('add-topic-form');
const topicNameInput = document.getElementById('topic-name');
const topicDescriptionInput = document.getElementById('topic-description');
const confirmAddTopicBtn = document.getElementById('confirm-add-topic');
const cancelAddTopicBtn = document.getElementById('cancel-add-topic');
const addTopicError = document.getElementById('add-topic-error');

// Элементы DOM - Область отображения карточек
const currentTopicElement = document.getElementById('current-topic');
const cardCounter = document.getElementById('card-counter');
const noCardsMessage = document.getElementById('no-cards-message'); 
const cardNavigation = document.getElementById('card-navigation'); 

// Элементы DOM - Режим переворота карточки
const flipCardContainer = document.getElementById('flip-card-container');
const cardElement = flipCardContainer.querySelector('.card');
const cardQuestion = document.getElementById('card-question');
const cardAnswer = document.getElementById('card-answer');
const cardFront = cardElement.querySelector('.card-front'); 
const cardBack = cardElement.querySelector('.card-back');  

// Элементы DOM - Режим изучения
const studyCardContainer = document.getElementById('study-card-container');
const studyCardQuestion = document.getElementById('study-card-question');
const studyCardAnswer = document.getElementById('study-card-answer');
const studyModeToggle = document.getElementById('study-mode-toggle');

// Элементы DOM - Действия с карточками (Добавить/Редактировать/Удалить)
const cardActions = document.getElementById('card-actions');
const addCardBtn = document.getElementById('add-card-btn');
const editCardBtn = document.getElementById('edit-card-btn');
const deleteCardBtn = document.getElementById('delete-card-btn');
const addFirstCardBtn = document.getElementById('add-first-card-btn'); 

// Элементы DOM - Кнопки навигации
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Элементы DOM - Прогресс
const progressBar = document.getElementById('progress-bar');
const progressPercentage = document.getElementById('progress-percentage');
const progressRatio = document.getElementById('progress-ratio');

// Элементы DOM - Модальное окно генерации
const generateBtn = document.getElementById('generate-btn'); 
const welcomeGenerateBtn = document.getElementById('welcome-generate'); 
const generateCardsLinkAlt = document.getElementById('generate-cards-link-alt'); 
const generateModal = document.getElementById('generate-modal');
const generateForm = document.getElementById('generate-form'); 
const generateTopicInput = document.getElementById('generate-topic');
const generateCountSelect = document.getElementById('generate-count');
const confirmGenerateBtn = document.getElementById('confirm-generate');
const cancelGenerateBtn = document.getElementById('cancel-generate');
const generateError = document.getElementById('generate-error');
const generationProgress = document.getElementById('generation-progress');
const generationProgressBar = document.getElementById('generation-progress-bar');

// Элементы DOM - Модальное окно добавления карточки
const addCardModal = document.getElementById('add-card-modal');
const addCardForm = document.getElementById('add-card-form');
const addCardQuestionInput = document.getElementById('add-card-question');
const addCardAnswerInput = document.getElementById('add-card-answer');
const addCardError = document.getElementById('add-card-error');
const cancelAddCardBtn = document.getElementById('cancel-add-card');
const confirmAddCardBtn = document.getElementById('confirm-add-card');

// Элементы DOM - Модальное окно редактирования карточки
const editCardModal = document.getElementById('edit-card-modal');
const editCardForm = document.getElementById('edit-card-form');
const editCardIdInput = document.getElementById('edit-card-id');
const editCardQuestionInput = document.getElementById('edit-card-question');
const editCardAnswerInput = document.getElementById('edit-card-answer');
const editCardError = document.getElementById('edit-card-error');
const cancelEditCardBtn = document.getElementById('cancel-edit-card');
const confirmEditCardBtn = document.getElementById('confirm-edit-card');

// Элементы DOM - Другое
const logoutBtn = document.getElementById('logout-btn');

const explainAiBtn = document.getElementById('explain-ai-btn');
const aiExplanationContainer = document.getElementById('ai-explanation-container');
const aiExplanationText = document.getElementById('ai-explanation-text');

async function apiRequest(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token || ''}`, // Добавить токен авторизации
        }
    };
    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options); // Выполнить запрос к API
        if (!response.ok) {
            if (response.status === 401) {
                logout(); // Выйти, если не авторизован
                throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
            }
            let errorData;
            try {
                 errorData = await response.json(); // Попытаться получить тело ошибки
            } catch(e) {
                errorData = { message: response.statusText || `HTTP ошибка ${response.status}` }; // Использовать статус-текст, если тело не JSON
            }
            throw new Error(errorData.message || `HTTP ошибка! Статус: ${response.status}`);
        }
        if (response.status === 204 || response.headers.get("content-length") === "0") {
            return null; // Вернуть null для ответов без контента
        }
        return await response.json(); // Вернуть JSON-данные
    } catch (error) {
        console.error('Ошибка запроса API:', endpoint, error);
        throw error; // Перебросить ошибку для обработки выше
    }
}

function toggleModal(modalElement, show) {
    if (show) {
        modalElement.classList.remove('hidden');
    } else {
        modalElement.classList.add('hidden');
    }
}

function displayModalError(errorElement, message) {
    errorElement.textContent = message || 'Произошла неизвестная ошибка.';
    errorElement.classList.remove('hidden');
}

function clearModalError(errorElement) {
     errorElement.textContent = '';
     errorElement.classList.add('hidden');
}

function toggleButtonLoading(buttonElement, isLoading, loadingText = 'Загрузка...', originalText = null) {
    if (!buttonElement) return;
    if (isLoading) {
        buttonElement.dataset.originalText = buttonElement.textContent;
        buttonElement.textContent = loadingText;
        buttonElement.disabled = true;
    } else {
        buttonElement.textContent = originalText || buttonElement.dataset.originalText || 'Отправить'; // Использовать 'Отправить' как запасной вариант
        buttonElement.disabled = false;
    }
}

// Проверка аутентификации
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html'; // Перенаправить на страницу входа, если токена нет
    }
}

// Функция выхода
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Загрузка списка тем
async function loadTopics() {
    try {
        const topics = await apiRequest('/topics');
        displayTopics(topics, []); // Отобразить темы
    } catch (error) {
        topicsList.innerHTML = `<li class="p-2 text-center text-red-500">Ошибка загрузки тем.</li>`;
        console.error("Ошибка в loadTopics:", error);
    }
}

// Отображение списка тем
function displayTopics(topics, allProgress = []) { // allProgress пока не используется, но оставлен для будущих улучшений
     if (!Array.isArray(topics)) {
        console.error("Получены неверные данные тем:", topics);
        topicsList.innerHTML = '<li class="p-2 text-center text-red-500">Не удалось загрузить данные тем.</li>';
        return;
     }

    if (topics.length === 0) {
        topicsList.innerHTML = '<li class="p-2 text-center text-gray-500">Тем пока нет. Добавьте одну!</li>';
        return;
    }

    // Отобразить каждую тему
    topicsList.innerHTML = topics.map(topic => {
        if (!topic || !topic._id) return ''; // Пропустить невалидные темы

        return `
            <li class="topic-item p-3 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer mb-2" data-id="${topic._id}">
                <span class="font-medium mr-2">${topic.name || 'Тема без названия'}</span>
                <!-- Место для отображения прогресса -->
            </li>
        `;
    }).join('');

    // Добавить обработчики кликов для каждой темы
    document.querySelectorAll('.topic-item').forEach(item => {
        const topicName = item.querySelector('span').textContent;
        item.addEventListener('click', () => loadCardsForTopic(item.dataset.id, topicName));
    });
}

// Открыть модальное окно добавления темы
function openAddTopicModal() {
    topicNameInput.value = '';
    topicDescriptionInput.value = '';
    toggleModal(addTopicModal, true);
    topicNameInput.focus(); // Установить фокус на поле имени
}

// Закрыть модальное окно добавления темы
function closeAddTopicModal() {
    toggleModal(addTopicModal, false);
}

// Обработка отправки формы добавления темы
async function handleAddTopicSubmit(event) {
    event.preventDefault(); // Предотвратить стандартную отправку формы
    const name = topicNameInput.value.trim();
    const description = topicDescriptionInput.value.trim();

    clearModalError(addTopicError); // Очистить предыдущие ошибки

    if (!name) {
        displayModalError(addTopicError, 'Название темы обязательно'); // Показать ошибку, если имя не введено
        return;
    }

    toggleButtonLoading(confirmAddTopicBtn, true, 'Adding...');

    try {
        const newTopic = await apiRequest('/topics', 'POST', { name, description });
        console.log(`Topic "${name}" added successfully!`);
        closeAddTopicModal();
        loadTopics();

    } catch (error) {
        console.error("Error adding topic:", error);
        displayModalError(addTopicError, error.message || 'Failed to add topic.'); 
    } finally {
        toggleButtonLoading(confirmAddTopicBtn, false);
    }
}

// --- Управление карточками ---

// Загрузка карточек для выбранной темы
async function loadCardsForTopic(topicId, topicName = 'Выбранная тема') {
    if (!topicId) {
        console.error("loadCardsForTopic вызван без topicId");
        updateUIState('error', 'Не удалось загрузить тему. ID не указан.');
        return;
    }
    currentTopicId = topicId;
    currentTopicElement.textContent = topicName; // Отобразить имя темы

    try {
        updateUIState('loading');
        currentCards = await apiRequest(`/topics/${topicId}/cards`); // Загрузить карточки
        await loadProgressForTopic(topicId); // Загрузить прогресс ПОСЛЕ карточек

        if (currentCards.length > 0) {
            currentCardIndex = 0;
            displayCard(currentCards[currentCardIndex], currentCardIndex, currentCards.length); // Отобразить первую карточку
            updateUIState('cards_loaded');
        } else {
            updateUIState('no_cards'); // Показать сообщение, если карточек нет
        }

        toggleStudyMode(studyModeToggle.checked, true); // Обновить режим изучения
    } catch (error) {
        console.error(`Ошибка загрузки карточек для темы ${topicId}:`, error);
        updateUIState('error', `Не удалось загрузить карточки: ${error.message}`);
    }
}

// Отображение текущей карточки
function displayCard(card, index, total) {
    if (!card) {
        updateUIState('no_cards'); // Обновить UI, если карточка недействительна
        return;
    }

    currentDisplayedCard = card; // Сохранить текущую карточку

    cardQuestion.textContent = card.question;
    cardAnswer.textContent = card.answer;
    studyCardQuestion.textContent = card.question;
    studyCardAnswer.textContent = card.answer;

    cardCounter.textContent = `${index + 1} / ${total}`; // Обновить счетчик

    // Сбросить состояние переворота карточки
    cardElement.classList.remove('is-flipped');

    updateUIState('cards_loaded'); // Убедиться, что UI находится в правильном состоянии
    updateCardNavigationButtons(); // Обновить состояние кнопок навигации
    aiExplanationContainer.classList.add('hidden'); // Скрыть объяснение ИИ при смене карточки
}

// Обновление состояния UI (отображение/скрытие элементов)
function updateUIState(state, message = '') {
    // Сначала скрыть всё, что может конфликтовать
    welcomeContainer.classList.add('hidden');
    flashcardContainer.classList.add('hidden');
    noCardsMessage.classList.add('hidden');
    cardNavigation.classList.add('hidden');
    cardActions.classList.add('hidden');
    progressContainer.classList.add('hidden'); // Скрыть прогресс по умолчанию
    // Добавить сброс ошибок?

    switch (state) {
        case 'initial':
            welcomeContainer.classList.remove('hidden');
            break;
        case 'loading':
            flashcardContainer.classList.remove('hidden'); // Показать контейнер карточек
            currentTopicElement.textContent = 'Загрузка темы...'; // Сообщение о загрузке
            break;
        case 'cards_loaded':
            flashcardContainer.classList.remove('hidden');
            cardNavigation.classList.remove('hidden');
            cardActions.classList.remove('hidden');
            progressContainer.classList.remove('hidden'); // Показать прогресс при загрузке карточек
            // Скрыть/показать flip/study контейнеры в зависимости от режима
            toggleStudyMode(studyModeToggle.checked, true);
            break;
        case 'no_cards':
            flashcardContainer.classList.remove('hidden'); // Показать контейнер, но с сообщением
            noCardsMessage.classList.remove('hidden');
            cardActions.classList.remove('hidden'); // Показать действия (Добавить карточку)
            progressContainer.classList.remove('hidden'); // Показать прогресс (0/0)
            break;
        case 'error':
            flashcardContainer.classList.remove('hidden'); // Показать контейнер для сообщения об ошибке
            currentTopicElement.textContent = 'Ошибка';
            // Отобразить сообщение об ошибке (нужен специальный элемент?)
            noCardsMessage.textContent = message || 'Произошла ошибка.'; // Переиспользовать noCardsMessage для ошибки
            noCardsMessage.classList.remove('hidden');
            noCardsMessage.classList.add('text-red-500'); // Стиль ошибки
            break;
    }
}

// Обновление состояния кнопок навигации (< >)
function updateCardNavigationButtons() {
    prevBtn.disabled = currentCardIndex <= 0;
    nextBtn.disabled = currentCardIndex >= currentCards.length - 1;
}

// Переход к следующей карточке
function nextCard() {
    if (currentCardIndex < currentCards.length - 1) {
        currentCardIndex++;
        displayCard(currentCards[currentCardIndex], currentCardIndex, currentCards.length);
    }
}

// Переход к предыдущей карточке
function prevCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        displayCard(currentCards[currentCardIndex], currentCardIndex, currentCards.length);
    }
}

// Переворот текущей карточки
function flipCard() {
    if (cardElement) {
        cardElement.classList.toggle('is-flipped');
    }
}

// Переключение режима изучения
function toggleStudyMode(isStudyMode, forceUpdate = false) {
    if (!forceUpdate && studyModeToggle.checked === isStudyMode) return; // Не делать ничего, если состояние не изменилось

    studyModeToggle.checked = isStudyMode; // Синхронизировать чекбокс

    if (isStudyMode) {
        flipCardContainer.classList.add('hidden');
        studyCardContainer.classList.remove('hidden');
        cardActions.classList.add('hidden'); // Скрыть Добавить/Редактировать/Удалить в режиме изучения
    } else {
        flipCardContainer.classList.remove('hidden');
        studyCardContainer.classList.add('hidden');
        if (currentCards.length > 0) {
            cardActions.classList.remove('hidden'); // Показать действия, если есть карточки
        }
    }
    // Убедиться, что правильные элементы видны при переключении
    if (currentCards.length === 0 && !isStudyMode) {
         updateUIState('no_cards'); // Вернуться к состоянию "нет карточек", если мы не в режиме изучения
    } else if (currentCards.length > 0) {
         updateUIState('cards_loaded'); // Обновить UI для отображения карточек/контейнеров
    }
}

// Открыть модальное окно добавления карточки
function openAddCardModal() {
    if (!currentTopicId) return; // Не открывать, если тема не выбрана
    addCardQuestionInput.value = '';
    addCardAnswerInput.value = '';
    clearModalError(addCardError);
    toggleModal(addCardModal, true);
    addCardQuestionInput.focus();
}

// Закрыть модальное окно добавления карточки
function closeAddCardModal() {
    toggleModal(addCardModal, false);
}

// Открыть модальное окно редактирования карточки
function openEditCardModal() {
    if (!currentDisplayedCard) return; // Не открывать, если карточка не отображена
    editCardIdInput.value = currentDisplayedCard._id;
    editCardQuestionInput.value = currentDisplayedCard.question;
    editCardAnswerInput.value = currentDisplayedCard.answer;
    clearModalError(editCardError);
    toggleModal(editCardModal, true);
    editCardQuestionInput.focus();
}

// Закрыть модальное окно редактирования карточки
function closeEditCardModal() {
    toggleModal(editCardModal, false);
}

// Обработка отправки формы добавления карточки
async function handleAddCardSubmit(event) {
    event.preventDefault();
    const question = addCardQuestionInput.value.trim();
    const answer = addCardAnswerInput.value.trim();

    clearModalError(addCardError);

    if (!question || !answer) {
        displayModalError(addCardError, 'Вопрос и ответ обязательны');
        return;
    }

    toggleButtonLoading(confirmAddCardBtn, true);

    try {
        const newCard = await apiRequest(`/topics/${currentTopicId}/cards`, 'POST', { question, answer });
        closeAddCardModal();
        // Добавить новую карточку локально и обновить UI
        currentCards.push(newCard); // Добавить в конец
        currentCardIndex = currentCards.length - 1; // Перейти к новой карточке
        displayCard(newCard, currentCardIndex, currentCards.length);
        updateProgressDisplay(); // Обновить отображение прогресса
    } catch (error) {
        displayModalError(addCardError, `Не удалось добавить карточку: ${error.message}`);
    } finally {
        toggleButtonLoading(confirmAddCardBtn, false, null, 'Add Card');
    }
}

// Обработка отправки формы редактирования карточки
async function handleEditCardSubmit(event) {
    event.preventDefault();
    const cardId = editCardIdInput.value;
    const question = editCardQuestionInput.value.trim();
    const answer = editCardAnswerInput.value.trim();

    clearModalError(editCardError);

    if (!question || !answer) {
        displayModalError(editCardError, 'Вопрос и ответ обязательны');
        return;
    }

    toggleButtonLoading(confirmEditCardBtn, true);

    try {
        // API ожидает question, answer в теле для PUT /api/cards/:id
        const updatedCard = await apiRequest(`/cards/${cardId}`, 'PUT', { question, answer });
        closeEditCardModal();

        // Обновить карточку в локальном массиве
        const indexToUpdate = currentCards.findIndex(card => card._id === cardId);
        if (indexToUpdate !== -1) {
            // Слить обновления, предполагая, что API возвращает полную обновленную карточку
            currentCards[indexToUpdate] = { ...currentCards[indexToUpdate], ...updatedCard, question, answer }; // Убедиться, что локальные поля обновлены, даже если PUT не возвращает тело
            currentCardIndex = indexToUpdate; // Остаться на отредактированной карточке
            displayCard(currentCards[currentCardIndex], currentCardIndex, currentCards.length);
        } else {
            // Карточка не найдена локально, возможно, перезагрузить всё как запасной вариант
            console.warn("Отредактированная карточка не найдена локально, перезагрузка...");
            loadCardsForTopic(currentTopicId, currentTopicElement.textContent);
        }
    } catch (error) {
        displayModalError(editCardError, `Не удалось обновить карточку: ${error.message}`);
    } finally {
        toggleButtonLoading(confirmEditCardBtn, false, null, 'Save Changes');
    }
}

// Удаление текущей карточки
async function handleDeleteCard() {
    if (!currentDisplayedCard) return;

    // Использовать более надежное подтверждение позже, если необходимо
    if (!confirm(`Вы уверены, что хотите удалить эту карточку?
Вопрос: ${currentDisplayedCard.question}`)) {
        return;
    }

    const cardIdToDelete = currentDisplayedCard._id;
    const deletedIndex = currentCardIndex;

    try {
        await apiRequest(`/cards/${cardIdToDelete}`, 'DELETE');

        // Удалить карточку из локального массива
        currentCards.splice(deletedIndex, 1);

        // Скорректировать индекс и обновить UI
        if (currentCards.length === 0) {
            currentDisplayedCard = null; // Очистить выбор
            updateUIState('no_cards');
        } else {
            // Показать предыдущую карточку или первую, если удалена первая/единственная оставшаяся
            currentCardIndex = Math.max(0, deletedIndex - 1); // Перейти к предыдущей или 0
            displayCard(currentCards[currentCardIndex], currentCardIndex, currentCards.length);
        }
        updateProgressDisplay(); // Обновить прогресс после удаления
    } catch (error) {
        console.error("Ошибка удаления карточки:", error);
        // Отобразить сообщение об ошибке пользователю?
        alert(`Не удалось удалить карточку: ${error.message}`);
    }
}

// --- Управление прогрессом ---

// Загрузка прогресса для темы
async function loadProgressForTopic(topicId) {
    if (!topicId) return;
    try {
        const progressData = await apiRequest(`/topics/${topicId}/progress`) || { knownCount: 0, unknownCount: 0 }; // По умолчанию 0, если нет прогресса
        progress = {
            knownCount: progressData.knownCount || 0,
            unknownCount: progressData.unknownCount || 0,
            // knownCardIds: progressData.knownCardIds || [], // Опционально: если нужно для логики UI
            // unknownCardIds: progressData.unknownCardIds || []
        };
        updateProgressDisplay(); // Обновить отображение
        progressContainer.classList.remove('hidden'); // Убедиться, что контейнер видим
    } catch (error) {
        console.error("Не удалось загрузить прогресс:", error);
        // Сбросить прогресс при ошибке
        progress = { knownCount: 0, unknownCount: 0 };
        updateProgressDisplay();
        // Решить, нужно ли скрывать контейнер прогресса при ошибке
        // progressContainer.classList.add('hidden');
    }
}

// Обновление отображения прогресса (полоса, текст)
function updateProgressDisplay() {
    const known = progress.knownCount || 0;
    const unknown = progress.unknownCount || 0;
    // Рассчитать процент только на основе отмеченных карточек
    const totalMarked = known + unknown;
    const percentage = totalMarked > 0 ? Math.round((known / totalMarked) * 100) : 0;

    // ^^ Это требует known/unknownCardIds от бэкенда, пока упростим
    // Давайте пока будем основывать прогресс на известных/общем количестве
    const displayTotal = currentCards.length; // Основывать процент на общем количестве карточек в теме
    const displayKnown = known; // Использовать известное количество из API
    const displayPercentage = displayTotal > 0 ? Math.round((displayKnown / displayTotal) * 100) : 0;

    progressBar.style.width = `${displayPercentage}%`;
    progressPercentage.textContent = `${displayPercentage}%`;
    progressRatio.textContent = `(${displayKnown} / ${displayTotal})`;
    progressContainer.classList.toggle('hidden', displayTotal === 0); // Скрыть, если нет карточек
}

// *** Функция для отметки карточки как изученной/неизученной ***
async function markCard(status) {
    if (!currentDisplayedCard || !currentTopicId) return; // Убедиться, что карточка и тема выбраны
    const cardId = currentDisplayedCard._id;

    try {
        // Отправить обновление на бэкенд
        const updatedProgress = await apiRequest(`/cards/${cardId}/mark`, 'POST', { status }); // status = 'known' или 'unknown'

        // Обновить локальное состояние прогресса из ответа
        if (updatedProgress) {
             progress = {
                knownCount: updatedProgress.knownCount || 0,
                unknownCount: updatedProgress.unknownCount || 0
            };
        }
        updateProgressDisplay(); // Обновить полосу прогресса
        // Переход к следующей карточке? (Опционально, можно добавить как настройку)
        // nextCard();
    } catch (error) {
        console.error(`Не удалось отметить карточку как ${status}:`, error);
        // Сообщить пользователю об ошибке?
        alert(`Не удалось обновить статус карточки: ${error.message}`);
    }
}

// --- Модальное окно генератора ---
// Открыть модальное окно генерации
function openGenerateModal(topicName = '') {
    generateTopicInput.value = topicName || ''; // Предзаполнить, если имя предоставлено
    generateCountSelect.value = '10';
    clearModalError(generateError);
    generationProgress.classList.add('hidden');
    toggleModal(generateModal, true);
    generateTopicInput.focus();
}

// Закрыть модальное окно генерации
function closeGenerateModal() {
    toggleModal(generateModal, false);
}

// Обработка отправки формы генерации
async function handleGenerateSubmit(event) {
    event.preventDefault();
    const topic = generateTopicInput.value.trim();
    const count = generateCountSelect.value;

    clearModalError(generateError);

    if (!topic) {
        displayModalError(generateError, 'Название темы обязательно.');
        return;
    }

    toggleButtonLoading(confirmGenerateBtn, true, 'Генерация...');
    cancelGenerateBtn.disabled = true; // Отключить отмену во время генерации
    generationProgress.classList.remove('hidden'); // Показать индикатор прогресса
    generationProgressBar.style.width = '0%'; // Сбросить полосу прогресса
    // Симуляция прогресса для лучшего UX (опционально)
    let progressInterval = setInterval(() => {
        let currentWidth = parseFloat(generationProgressBar.style.width);
        if (currentWidth < 90) { // Симулировать прогресс до 90%
            generationProgressBar.style.width = (currentWidth + 5) + '%';
        }
    }, 200);

    try {
        // Вызвать API генерации (возвращает только карточки)
        const generatedData = await apiRequest('/generate', 'POST', { topic, count });

        clearInterval(progressInterval); // Остановить симуляцию
        generationProgressBar.style.width = '100%'; // Отметить как завершенное

        if (!generatedData || !Array.isArray(generatedData.cards) || generatedData.cards.length === 0) {
             throw new Error("ИИ не смог сгенерировать валидные карточки.");
        }

        // Сохранить сгенерированные карточки (отправляет POST на /generate/save)
        // Добавить небольшую задержку перед сохранением, чтобы показать 100% прогресс
        await new Promise(resolve => setTimeout(resolve, 300));

        const saveData = await apiRequest('/generate/save', 'POST', {
            topicName: topic,
            // topicDescription: `Сгенерированные карточки о ${topic}`, // Опциональное описание
            cards: generatedData.cards
        });

        console.log(saveData.message || `Сгенерировано и сохранено ${generatedData.cards.length} карточек для "${topic}"!`);
        closeGenerateModal();
        loadTopics(); // Обновить список тем, чтобы включить новую

        // Опционально: немедленно загрузить новую сгенерированную тему
        if (saveData.topic && saveData.topic._id) {
            loadCardsForTopic(saveData.topic._id, saveData.topic.name);
        }

    } catch (error) {
        clearInterval(progressInterval); // Остановить симуляцию при ошибке
        displayModalError(generateError, error.message || 'Не удалось сгенерировать карточки.');
        generationProgress.classList.add('hidden'); // Скрыть прогресс при ошибке
    } finally {
        toggleButtonLoading(confirmGenerateBtn, false);
        cancelGenerateBtn.disabled = false; // Включить отмену снова
         // Сбросить полосу прогресса после небольшой задержки, если модальное окно не закрывается автоматически
        setTimeout(() => {
            generationProgressBar.style.width = '0%';
            generationProgress.classList.add('hidden');
        }, 1000);
    }
}

// *** Функция для обработки запроса на объяснение ИИ ***
async function handleExplainAI() {
    if (!currentDisplayedCard) {
        console.error("Не могу объяснить: карточка не выбрана.");
        return;
    }

    const question = currentDisplayedCard.question;
    const answer = currentDisplayedCard.answer;

    // Добавляем класс для подсветки кнопки
    explainAiBtn.classList.add('active');
    explainAiBtn.classList.add('text-yellow-600');
    explainAiBtn.classList.add('bg-yellow-100');

    // Показываем контейнер объяснения
    aiExplanationContainer.classList.remove('hidden');
    aiExplanationText.textContent = 'Генерация объяснения...';

    try {
        const data = await apiRequest('/generate/explain', 'POST', { question, answer });
        if (data && data.explanation) {
            aiExplanationText.textContent = data.explanation;
        } else {
             aiExplanationText.textContent = 'Не удалось получить объяснение.';
             console.error("Не удалось получить объяснение от ИИ.");
        }
    } catch (error) {
        aiExplanationText.textContent = `Ошибка: ${error.message}`;
        console.error(`Не удалось получить объяснение: ${error.message}`);
    } finally {
        // Удаляем класс подсветки после завершения запроса
        setTimeout(() => {
            explainAiBtn.classList.remove('active');
            explainAiBtn.classList.remove('text-yellow-600');
            explainAiBtn.classList.remove('bg-yellow-100');
        }, 1000); // Оставляем подсветку на 1 секунду после завершения для лучшего UX
    }
}

// --- Инициализация ---
function initializeDashboard() {
    // Базовая настройка
    checkAuth(); // Убедиться, что пользователь вошел в систему

    // Обработчики событий - Выход
    logoutBtn.addEventListener('click', logout);

    // Обработчики событий - Темы
    addTopicBtn.addEventListener('click', openAddTopicModal);
    welcomeAddTopicBtn.addEventListener('click', openAddTopicModal); // Кнопка на экране приветствия
    cancelAddTopicBtn.addEventListener('click', closeAddTopicModal);
    addTopicForm.addEventListener('submit', handleAddTopicSubmit); // НОВЫЙ обработчик на форме

    // Обработчики событий - Генерация карточек
    generateBtn.addEventListener('click', () => openGenerateModal()); // Кнопка навигации
    welcomeGenerateBtn.addEventListener('click', () => openGenerateModal()); // Кнопка на экране приветствия
    generateCardsLinkAlt.addEventListener('click', () => openGenerateModal(currentTopicElement.textContent)); // Ссылка в сообщении "нет карточек"
    cancelGenerateBtn.addEventListener('click', closeGenerateModal);
    generateForm.addEventListener('submit', handleGenerateSubmit); // НОВЫЙ обработчик на форме

    // Обработчики событий - Взаимодействие с карточками
    flipCardContainer.addEventListener('click', (event) => {
         // Переворачивать только в режиме переворота и при клике на саму карточку
         if (!studyModeToggle.checked &&
             (event.target === cardFront || event.target === cardBack ||
             event.target.closest('.card-front') || event.target.closest('.card-back'))) {
              // Предотвратить отметку при клике для первоначального переворота
             if (!cardElement.classList.contains('is-flipped')) {
                  flipCard();
             }
         }
    });

    // *** Добавить обработчик специально для отметки на обратной стороне карточки ***
    cardBack.addEventListener('click', function(e) {
        // Срабатывать только в режиме переворота И если карточка действительно перевернута
        if (studyModeToggle.checked || !cardElement.classList.contains('is-flipped')) return;

        // Игнорировать клики непосредственно на кнопке объяснения ИИ
        if (e.target.closest('#explain-ai-btn')) return;

        const rect = cardBack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const status = (x < rect.width / 2) ? 'unknown' : 'known';
        const flashClass = (status === 'unknown') ? 'flash-red' : 'flash-green';

        // Добавить визуальную вспышку ко ВСЕЙ обратной стороне карточки
        cardBack.classList.add(flashClass);
        setTimeout(() => cardBack.classList.remove(flashClass), 300); // Убрать класс после анимации

        // Отметить карточку и потенциально перейти к следующей
        markCard(status);
    });

    // *** Добавить обработчик для отметки в режиме изучения ***
    studyCardContainer.addEventListener('click', function(e) {
        // Срабатывать только в режиме изучения
        if (!studyModeToggle.checked) return;

        const innerCard = e.target.closest('.study-card-inner');
        if (!innerCard) return;

        const rect = innerCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const isLeftSide = x < rect.width / 2;

        // Определяем, на какой стороне был клик и какой элемент будем подсвечивать
        if (isLeftSide) {
            // Клик по стороне вопроса (левая) - отметить как неизвестно (красный)
            // Подсвечиваем всю левую половину карточки
            const questionSide = innerCard.querySelector('.study-card-question');
            questionSide.classList.add('flash-red');
            setTimeout(() => questionSide.classList.remove('flash-red'), 300);
            markCard('unknown');
        } else {
            // Клик по стороне ответа (правая) - отметить как известно (зеленый)
            // Подсвечиваем всю правую половину карточки
            const answerSide = innerCard.querySelector('.study-card-answer');
            answerSide.classList.add('flash-green');
            setTimeout(() => answerSide.classList.remove('flash-green'), 300);
            markCard('known');
        }
    });


    nextBtn.addEventListener('click', nextCard);
    prevBtn.addEventListener('click', prevCard);
    studyModeToggle.addEventListener('change', () => toggleStudyMode(studyModeToggle.checked, true)); // Обновить UI при изменении

    // Обработчики событий - Модальные окна и действия Добавить/Редактировать/Удалить карточку
    addCardBtn.addEventListener('click', openAddCardModal); // Кнопка в действиях с карточкой
    addFirstCardBtn.addEventListener('click', openAddCardModal); // Кнопка в сообщении "нет карточек"
    cancelAddCardBtn.addEventListener('click', closeAddCardModal);
    addCardForm.addEventListener('submit', handleAddCardSubmit);

    editCardBtn.addEventListener('click', openEditCardModal);
    cancelEditCardBtn.addEventListener('click', closeEditCardModal);
    editCardForm.addEventListener('submit', handleEditCardSubmit);

    deleteCardBtn.addEventListener('click', handleDeleteCard);

    // *** Добавить обработчик событий для кнопки объяснения ИИ ***
    explainAiBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Предотвратить всплытие клика до обработчика отметки cardBack
        handleExplainAI();
    });

    // Начальная загрузка
    loadTopics(); // Загрузить темы при инициализации панели управления
    updateUIState('welcome'); // Начать с видимого приветственного сообщения
}

// Инициализировать панель управления, когда DOM готов
document.addEventListener('DOMContentLoaded', initializeDashboard); 