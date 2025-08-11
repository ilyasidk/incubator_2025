// Конфигурация
const API_URL = 'https://incubator-2025.onrender.com/api'; // Production сервер на Render

// Переменные состояния
let currentTopicId = null;
let currentCards = [];
let currentCardIndex = 0;
let currentDisplayedCard = null; // Хранить текущий видимый объект карточки
let progress = { knownCount: 0, unknownCount: 0 }; // Добавить переменную состояния прогресса обратно
let studyAnswerRevealed = false; // Для отслеживания показан ли ответ в study mode

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
const studyQuestionCard = document.getElementById('study-question-card');
const studyAnswerCard = document.getElementById('study-answer-card');
const studyCardQuestion = document.getElementById('study-card-question');
const studyCardAnswer = document.getElementById('study-card-answer');
const studyKnowledgeButtons = document.getElementById('study-knowledge-buttons');
const studyModeToggle = document.getElementById('study-mode-toggle');

// Элементы DOM - Действия с карточками (Добавить/Редактировать/Удалить)
const cardActions = document.getElementById('card-actions');
const addCardBtn = document.getElementById('add-card-btn');
const batchAddCardBtn = document.getElementById('batch-add-card-btn');
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

// Элементы DOM - Модальное окно массового добавления карточек
const batchAddCardsModal = document.getElementById('batch-add-cards-modal');
const batchAddCardsForm = document.getElementById('batch-add-cards-form');
const batchCardsInput = document.getElementById('batch-cards-input');
const batchSkipDuplicates = document.getElementById('batch-skip-duplicates');
const batchCardsCount = document.getElementById('batch-cards-count');
const batchAddCardsError = document.getElementById('batch-add-cards-error');
const batchAddCardsPreview = document.getElementById('batch-add-cards-preview');
const batchPreviewList = document.getElementById('batch-preview-list');
const cancelBatchAddCardsBtn = document.getElementById('cancel-batch-add-cards');
const previewBatchCardsBtn = document.getElementById('preview-batch-cards');
const confirmBatchAddCardsBtn = document.getElementById('confirm-batch-add-cards');

// Элементы DOM - Другое
const logoutBtn = document.getElementById('logout-btn');



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
        console.log(`Загружаем карточки для темы ${topicId} по адресу: ${API_URL}/cards/topic/${topicId}`);
        
        currentCards = await apiRequest(`/cards/topic/${topicId}`); // Загрузить карточки
        console.log(`Загружено карточек: ${currentCards.length}`, currentCards);
        
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

    // Обновить flip mode карточки
    cardQuestion.textContent = card.question;
    cardAnswer.textContent = card.answer;
    
    // Обновить study mode карточки
    studyCardQuestion.textContent = card.question;
    studyCardAnswer.textContent = card.answer;
    
    // Сбросить состояние study mode
    studyAnswerRevealed = false;
    resetStudyMode();

    cardCounter.textContent = `${index + 1} / ${total}`; // Обновить счетчик

    // Сбросить состояние переворота карточки
    cardElement.classList.remove('is-flipped');

    updateUIState('cards_loaded'); // Убедиться, что UI находится в правильном состоянии
    updateCardNavigationButtons(); // Обновить состояние кнопок навигации
}

// Сброс состояния study mode к показу только вопроса
function resetStudyMode() {
    if (studyQuestionCard && studyAnswerCard && studyKnowledgeButtons) {
        studyQuestionCard.classList.remove('hidden');
        studyAnswerCard.classList.add('hidden');
        studyKnowledgeButtons.classList.add('hidden');
    }
}

// Показать ответ в study mode
function showStudyAnswer() {
    if (!studyAnswerRevealed && studyQuestionCard && studyAnswerCard && studyKnowledgeButtons) {
        studyAnswerRevealed = true;
        studyQuestionCard.classList.add('hidden');
        studyAnswerCard.classList.remove('hidden');
        studyKnowledgeButtons.classList.remove('hidden');
    }
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
    // Убрать рекурсивные вызовы updateUIState - управление состоянием происходит в updateUIState
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
        const newCard = await apiRequest('/cards', 'POST', { 
            topicId: currentTopicId,
            question, 
            answer 
        });
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
        const progressData = await apiRequest(`/progress/topic/${topicId}`) || { knownCount: 0, unknownCount: 0 }; // По умолчанию 0, если нет прогресса
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

// *** Функция для отметки карточки с уровнем знания (0-3) ***
async function markCardWithLevel(knowledgeLevel) {
    if (!currentDisplayedCard || !currentTopicId) return; // Убедиться, что карточка и тема выбраны
    const cardId = currentDisplayedCard._id;

    try {
        console.log(`Отмечаем карточку ${cardId} с уровнем знания: ${knowledgeLevel}`);
        
        // Отправить обновление на бэкенд
        const updatedProgress = await apiRequest(`/cards/${cardId}/mark`, 'POST', { knowledgeLevel });

        // Обновить локальное состояние прогресса из ответа
        if (updatedProgress) {
             progress = {
                knowledgeLevel: knowledgeLevel,
                knownCount: updatedProgress.knownCount || 0,
                unknownCount: updatedProgress.unknownCount || 0
            };
        }
        
        // Обновить уровень знания в локальной карточке
        currentDisplayedCard.knowledgeLevel = knowledgeLevel;
        
        updateProgressDisplay(); // Обновить полосу прогресса
        
        // Автоматически переходим к следующей карточке после оценки
        setTimeout(() => {
            nextCard();
        }, 500);
        
    } catch (error) {
        console.error(`Не удалось отметить карточку с уровнем ${knowledgeLevel}:`, error);
        alert(`Не удалось обновить статус карточки: ${error.message}`);
    }
}

// Функция для оценки и автоматического перехода к следующей карточке
async function markCardWithLevelAndNext(knowledgeLevel) {
    if (!currentDisplayedCard || !currentTopicId) return;
    
    try {
        await markCardWithLevel(knowledgeLevel);
        // Небольшая задержка для показа обратной связи
        setTimeout(() => {
            nextCard();
        }, 300);
    } catch (error) {
        console.error('Ошибка при оценке карточки:', error);
    }
}

// Старая функция для совместимости
async function markCard(status) {
    const level = status === 'known' ? 3 : 0;
    await markCardWithLevel(level);
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

    // Обработчик клика на карточку с вопросом в study mode
    if (studyQuestionCard) {
        studyQuestionCard.addEventListener('click', showStudyAnswer);
    }


    nextBtn.addEventListener('click', nextCard);
    prevBtn.addEventListener('click', prevCard);
    studyModeToggle.addEventListener('change', () => toggleStudyMode(studyModeToggle.checked, true)); // Обновить UI при изменении

    // Обработчики событий - Модальные окна и действия Добавить/Редактировать/Удалить карточку
    addCardBtn.addEventListener('click', openAddCardModal); // Кнопка в действиях с карточкой
    addFirstCardBtn.addEventListener('click', openAddCardModal); // Кнопка в сообщении "нет карточек"
    cancelAddCardBtn.addEventListener('click', closeAddCardModal);
    addCardForm.addEventListener('submit', handleAddCardSubmit);

    // Обработчики событий - Массовое добавление карточек
    batchAddCardBtn.addEventListener('click', openBatchAddCardsModal);
    cancelBatchAddCardsBtn.addEventListener('click', closeBatchAddCardsModal);
    previewBatchCardsBtn.addEventListener('click', previewBatchCards);
    batchAddCardsForm.addEventListener('submit', handleBatchAddCardsSubmit);
    batchCardsInput.addEventListener('input', updateBatchCardsCount);

    editCardBtn.addEventListener('click', openEditCardModal);
    cancelEditCardBtn.addEventListener('click', closeEditCardModal);
    editCardForm.addEventListener('submit', handleEditCardSubmit);

    deleteCardBtn.addEventListener('click', handleDeleteCard);



    // Начальная загрузка
    loadTopics(); // Загрузить темы при инициализации панели управления
    updateUIState('initial'); // Начать с видимого приветственного сообщения
}

// --- Функции массового добавления карточек ---

function parseBatchCards(inputText) {
    const lines = inputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const cards = [];
    const invalidLines = [];
    
    lines.forEach((line, index) => {
        // Поддерживаем различные разделители: -, --, :, |
        const separators = [' - ', ' -- ', ': ', ' | '];
        let parts = null;
        let separator = null;
        
        for (const sep of separators) {
            if (line.includes(sep)) {
                parts = line.split(sep);
                separator = sep;
                break;
            }
        }
        
        if (parts && parts.length >= 2) {
            const question = parts[0].trim();
            const answer = parts.slice(1).join(separator).trim(); // Объединить остальные части если есть разделитель в ответе
            
            if (question && answer) {
                cards.push({ question, answer });
            } else {
                invalidLines.push({ line: index + 1, content: line, reason: 'Пустой вопрос или ответ' });
            }
        } else {
            invalidLines.push({ line: index + 1, content: line, reason: 'Неверный формат (ожидается: вопрос - ответ)' });
        }
    });
    
    return { cards, invalidLines };
}

function openBatchAddCardsModal() {
    if (!currentTopicId) {
        alert('Сначала выберите тему для добавления карточек');
        return;
    }
    
    // Сбросить форму
    batchCardsInput.value = '';
    batchSkipDuplicates.checked = true;
    batchAddCardsError.classList.add('hidden');
    batchAddCardsPreview.classList.add('hidden');
    updateBatchCardsCount();
    
    batchAddCardsModal.classList.remove('hidden');
}

function closeBatchAddCardsModal() {
    batchAddCardsModal.classList.add('hidden');
}

function updateBatchCardsCount() {
    const text = batchCardsInput.value.trim();
    if (!text) {
        batchCardsCount.textContent = 'Карточек: 0';
        return;
    }
    
    const { cards, invalidLines } = parseBatchCards(text);
    const validCount = cards.length;
    const invalidCount = invalidLines.length;
    
    if (invalidCount > 0) {
        batchCardsCount.textContent = `Карточек: ${validCount} (${invalidCount} неверных)`;
        batchCardsCount.className = 'text-sm text-amber-600';
    } else {
        batchCardsCount.textContent = `Карточек: ${validCount}`;
        batchCardsCount.className = 'text-sm text-gray-500';
    }
}

function previewBatchCards() {
    const text = batchCardsInput.value.trim();
    if (!text) {
        showBatchError('Введите карточки для предпросмотра');
        return;
    }
    
    const { cards, invalidLines } = parseBatchCards(text);
    
    if (cards.length === 0) {
        showBatchError('Не найдено ни одной корректной карточки');
        return;
    }
    
    // Фильтрация дубликатов если включена опция
    let filteredCards = cards;
    let duplicatesRemoved = 0;
    
    if (batchSkipDuplicates.checked && currentCards.length > 0) {
        const existingQuestions = new Set(currentCards.map(card => card.question.toLowerCase().trim()));
        const uniqueCards = [];
        
        cards.forEach(card => {
            if (!existingQuestions.has(card.question.toLowerCase().trim())) {
                uniqueCards.push(card);
            } else {
                duplicatesRemoved++;
            }
        });
        
        filteredCards = uniqueCards;
    }
    
    // Отобразить предпросмотр
    let previewHTML = '';
    
    if (filteredCards.length > 0) {
        previewHTML += '<div class="space-y-2">';
        filteredCards.slice(0, 10).forEach((card, index) => {
            previewHTML += `
                <div class="flex justify-between text-xs p-2 bg-white rounded border">
                    <span class="font-medium text-blue-600">${card.question}</span>
                    <span class="text-gray-600">${card.answer}</span>
                </div>
            `;
        });
        
        if (filteredCards.length > 10) {
            previewHTML += `<div class="text-xs text-gray-500 text-center">... и еще ${filteredCards.length - 10} карточек</div>`;
        }
        previewHTML += '</div>';
        
        if (duplicatesRemoved > 0) {
            previewHTML += `<div class="mt-2 text-xs text-amber-600">Будет пропущено дубликатов: ${duplicatesRemoved}</div>`;
        }
    }
    
    if (invalidLines.length > 0) {
        previewHTML += '<div class="mt-3"><h4 class="text-xs font-medium text-red-600 mb-1">Неверные строки:</h4>';
        previewHTML += '<div class="space-y-1">';
        invalidLines.slice(0, 5).forEach(invalid => {
            previewHTML += `<div class="text-xs text-red-500">Строка ${invalid.line}: ${invalid.content} (${invalid.reason})</div>`;
        });
        if (invalidLines.length > 5) {
            previewHTML += `<div class="text-xs text-red-400">... и еще ${invalidLines.length - 5} неверных строк</div>`;
        }
        previewHTML += '</div></div>';
    }
    
    batchPreviewList.innerHTML = previewHTML;
    batchAddCardsPreview.classList.remove('hidden');
    hideBatchError();
}

async function handleBatchAddCardsSubmit(event) {
    event.preventDefault();
    
    const text = batchCardsInput.value.trim();
    if (!text) {
        showBatchError('Введите карточки для добавления');
        return;
    }
    
    if (!currentTopicId) {
        showBatchError('Не выбрана тема для добавления карточек');
        return;
    }
    
    const { cards, invalidLines } = parseBatchCards(text);
    
    if (cards.length === 0) {
        showBatchError('Не найдено ни одной корректной карточки');
        return;
    }
    
    // Фильтрация дубликатов если включена опция
    let cardsToAdd = cards;
    if (batchSkipDuplicates.checked && currentCards.length > 0) {
        const existingQuestions = new Set(currentCards.map(card => card.question.toLowerCase().trim()));
        cardsToAdd = cards.filter(card => !existingQuestions.has(card.question.toLowerCase().trim()));
    }
    
    if (cardsToAdd.length === 0) {
        showBatchError('Все карточки уже существуют в этой теме');
        return;
    }
    
    try {
        // Отключить кнопку во время загрузки
        confirmBatchAddCardsBtn.disabled = true;
        confirmBatchAddCardsBtn.textContent = 'Добавление...';
        
        const response = await apiRequest('/cards/batch', 'POST', {
            topicId: currentTopicId,
            cards: cardsToAdd,
            source: 'USER'
        });
        
        if (response) {
            // Успешно добавлены карточки
            await loadCardsForTopic(currentTopicId, currentTopicElement.textContent);
            closeBatchAddCardsModal();
            
            const addedCount = cardsToAdd.length;
            const skippedCount = cards.length - addedCount;
            let message = `Успешно добавлено ${addedCount} карточек`;
            if (skippedCount > 0) {
                message += `, пропущено дубликатов: ${skippedCount}`;
            }
            if (invalidLines.length > 0) {
                message += `, неверных строк: ${invalidLines.length}`;
            }
            
            // Показать уведомление об успехе (можно добавить toast notification)
            alert(message);
        }
    } catch (error) {
        console.error('Ошибка при массовом добавлении карточек:', error);
        showBatchError(`Ошибка при добавлении карточек: ${error.message}`);
    } finally {
        // Восстановить кнопку
        confirmBatchAddCardsBtn.disabled = false;
        confirmBatchAddCardsBtn.textContent = 'Добавить карточки';
    }
}

function showBatchError(message) {
    batchAddCardsError.textContent = message;
    batchAddCardsError.classList.remove('hidden');
}

function hideBatchError() {
    batchAddCardsError.classList.add('hidden');
}

// Сделать функции глобальными для доступа из HTML
window.markCardWithLevel = markCardWithLevel;
window.markCardWithLevelAndNext = markCardWithLevelAndNext;

// Инициализировать панель управления, когда DOM готов
document.addEventListener('DOMContentLoaded', initializeDashboard); 