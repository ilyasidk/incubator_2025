// Configuration
const API_URL = '/api'; // Define the base URL for the backend API

// State Variables
let currentTopicId = null;
let currentCards = [];
let currentCardIndex = 0;
let currentDisplayedCard = null; // Store the currently visible card object
let progress = { knownCount: 0, unknownCount: 0 }; // Add progress state variable back

// DOM Elements - Main Containers
const welcomeContainer = document.getElementById('welcome-container');
const flashcardContainer = document.getElementById('flashcard-container');
const progressContainer = document.getElementById('progress-container');

// DOM Elements - Topics
const topicsList = document.getElementById('topics-list');
const addTopicBtn = document.getElementById('add-topic-btn');
const welcomeAddTopicBtn = document.getElementById('welcome-add-topic');

// DOM Elements - Topic Modal
const addTopicModal = document.getElementById('add-topic-modal');
const addTopicForm = document.getElementById('add-topic-form');
const topicNameInput = document.getElementById('topic-name');
const topicDescriptionInput = document.getElementById('topic-description');
const confirmAddTopicBtn = document.getElementById('confirm-add-topic');
const cancelAddTopicBtn = document.getElementById('cancel-add-topic');
const addTopicError = document.getElementById('add-topic-error');

// DOM Elements - Flashcard Display Area
const currentTopicElement = document.getElementById('current-topic');
const cardCounter = document.getElementById('card-counter');
const noCardsMessage = document.getElementById('no-cards-message'); // Message div
const cardNavigation = document.getElementById('card-navigation'); // Nav buttons container

// DOM Elements - Flip Card Mode
const flipCardContainer = document.getElementById('flip-card-container');
const cardElement = flipCardContainer.querySelector('.card');
const cardQuestion = document.getElementById('card-question');
const cardAnswer = document.getElementById('card-answer');
const cardFront = cardElement.querySelector('.card-front'); // More specific selector
const cardBack = cardElement.querySelector('.card-back');   // More specific selector

// DOM Elements - Study Mode
const studyCardContainer = document.getElementById('study-card-container');
const studyCardQuestion = document.getElementById('study-card-question');
const studyCardAnswer = document.getElementById('study-card-answer');
const studyModeToggle = document.getElementById('study-mode-toggle');

// DOM Elements - Card Actions (Add/Edit/Delete)
const cardActions = document.getElementById('card-actions');
const addCardBtn = document.getElementById('add-card-btn');
const editCardBtn = document.getElementById('edit-card-btn');
const deleteCardBtn = document.getElementById('delete-card-btn');
const addFirstCardBtn = document.getElementById('add-first-card-btn'); // In no-cards message

// DOM Elements - Navigation Buttons
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// DOM Elements - Progress
const progressBar = document.getElementById('progress-bar');
const progressPercentage = document.getElementById('progress-percentage');
const progressRatio = document.getElementById('progress-ratio');

// DOM Elements - Generate Modal
const generateBtn = document.getElementById('generate-btn'); // Button in nav
const welcomeGenerateBtn = document.getElementById('welcome-generate'); // Button in welcome message
const generateCardsLinkAlt = document.getElementById('generate-cards-link-alt'); // Link in no-cards message
const generateModal = document.getElementById('generate-modal');
const generateForm = document.getElementById('generate-form'); // Get the form element
const generateTopicInput = document.getElementById('generate-topic');
const generateCountSelect = document.getElementById('generate-count');
const confirmGenerateBtn = document.getElementById('confirm-generate');
const cancelGenerateBtn = document.getElementById('cancel-generate');
const generateError = document.getElementById('generate-error');
const generationProgress = document.getElementById('generation-progress');
const generationProgressBar = document.getElementById('generation-progress-bar'); // Get progress bar

// DOM Elements - Add Card Modal
const addCardModal = document.getElementById('add-card-modal');
const addCardForm = document.getElementById('add-card-form');
const addCardQuestionInput = document.getElementById('add-card-question');
const addCardAnswerInput = document.getElementById('add-card-answer');
const addCardError = document.getElementById('add-card-error');
const cancelAddCardBtn = document.getElementById('cancel-add-card');
const confirmAddCardBtn = document.getElementById('confirm-add-card');

// DOM Elements - Edit Card Modal
const editCardModal = document.getElementById('edit-card-modal');
const editCardForm = document.getElementById('edit-card-form');
const editCardIdInput = document.getElementById('edit-card-id');
const editCardQuestionInput = document.getElementById('edit-card-question');
const editCardAnswerInput = document.getElementById('edit-card-answer');
const editCardError = document.getElementById('edit-card-error');
const cancelEditCardBtn = document.getElementById('cancel-edit-card');
const confirmEditCardBtn = document.getElementById('confirm-edit-card');

// DOM Elements - Other
const logoutBtn = document.getElementById('logout-btn');

// New elements
const explainAiBtn = document.getElementById('explain-ai-btn');
const aiExplanationContainer = document.getElementById('ai-explanation-container');
const aiExplanationText = document.getElementById('ai-explanation-text');

// --- Utility Functions ---
async function apiRequest(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token || ''}`, // Include token if available
        }
    };
    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }
    try {
        // Construct the full URL using API_URL and endpoint
        const response = await fetch(`${API_URL}/api${endpoint}`, options); 
        if (!response.ok) {
            if (response.status === 401) {
                logout(); // Token expired or invalid
                throw new Error('Session expired. Please log in again.');
            }
            let errorData;
            try {
                 errorData = await response.json();
            } catch(e) {
                errorData = { message: response.statusText || `HTTP error ${response.status}` };
            }
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        // Handle responses that might not have a body (e.g., DELETE, PUT with no content)
        if (response.status === 204 || response.headers.get("content-length") === "0") {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('API Request Error:', endpoint, error);
        throw error; // Re-throw
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
    errorElement.textContent = message || 'An unknown error occurred.';
    errorElement.classList.remove('hidden');
}

function clearModalError(errorElement) {
     errorElement.textContent = '';
     errorElement.classList.add('hidden');
}

function toggleButtonLoading(buttonElement, isLoading, loadingText = 'Loading...', originalText = null) {
    if (!buttonElement) return;
    if (isLoading) {
        buttonElement.dataset.originalText = buttonElement.textContent; // Store original text
        buttonElement.textContent = loadingText;
        buttonElement.disabled = true;
    } else {
        buttonElement.textContent = originalText || buttonElement.dataset.originalText || 'Submit'; // Restore text
        buttonElement.disabled = false;
    }
}


// --- Authentication ---
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Redirect to login page if no token
        window.location.href = 'index.html';
    }
    // Optionally, could add a check here to verify token with the backend
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}


// --- Topic Management ---
async function loadTopics() {
    try {
        const topics = await apiRequest('/topics');
        displayTopics(topics, []);
    } catch (error) {
        topicsList.innerHTML = `<li class="p-2 text-center text-red-500">Error loading topics.</li>`;
        console.error("Error in loadTopics:", error);
    }
}

function displayTopics(topics, allProgress = []) { // Default progress to empty array
     if (!Array.isArray(topics)) {
        console.error("Invalid topics data received:", topics);
        topicsList.innerHTML = '<li class="p-2 text-center text-red-500">Failed to load topics data.</li>';
        return;
     }

    if (topics.length === 0) {
        topicsList.innerHTML = '<li class="p-2 text-center text-gray-500">No topics yet. Add one!</li>';
        return;
    }

    // Create a map of topic progress by topicId for quick lookup (if progress data is available)
    // const progressMap = {};
    // if(Array.isArray(allProgress)) {
    //     allProgress.forEach(prog => {
    //         if(prog && prog.topicId) { // Basic validation
    //              progressMap[prog.topicId] = prog;
    //         }
    //     });
    // }

    topicsList.innerHTML = topics.map(topic => {
        if (!topic || !topic._id) return ''; // Skip invalid topic data

        // Progress display logic (currently commented out)
        // ...

        // Removed flex, justify-between, items-center and the SVG icon
        return `
            <li class="topic-item p-3 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer mb-2" data-id="${topic._id}">
                <span class="font-medium mr-2">${topic.name || 'Unnamed Topic'}</span>
                <!-- Progress display placeholder -->
            </li>
        `;
    }).join('');

    // Add event listeners to topic items
    document.querySelectorAll('.topic-item').forEach(item => {
        // Pass topic name to loadCardsForTopic for immediate display
        const topicName = item.querySelector('span').textContent;
        item.addEventListener('click', () => loadCardsForTopic(item.dataset.id, topicName));
    });
}

function openAddTopicModal() {
    topicNameInput.value = '';
    topicDescriptionInput.value = '';
    toggleModal(addTopicModal, true);
    topicNameInput.focus();
}

function closeAddTopicModal() {
    toggleModal(addTopicModal, false);
}

async function handleAddTopicSubmit(event) {
    event.preventDefault(); // Prevent default form submission
    const name = topicNameInput.value.trim();
    const description = topicDescriptionInput.value.trim();

    clearModalError(addTopicError); // Clear previous errors

    if (!name) {
        displayModalError(addTopicError, 'Topic name is required'); // Display error in modal
        return;
    }

    toggleButtonLoading(confirmAddTopicBtn, true, 'Adding...');

    try {
        const newTopic = await apiRequest('/topics', 'POST', { name, description });
        console.log(`Topic "${name}" added successfully!`);
        closeAddTopicModal();
        loadTopics(); // Refresh the list

    } catch (error) {
        console.error("Error adding topic:", error);
        displayModalError(addTopicError, error.message || 'Failed to add topic.'); // Display error in modal
    } finally {
        toggleButtonLoading(confirmAddTopicBtn, false);
    }
}

// --- Card Management ---
async function loadCardsForTopic(topicId, topicName = 'Selected Topic') {
    currentTopicId = topicId;
    currentCards = [];
    currentCardIndex = 0;
    currentDisplayedCard = null;
    currentTopicElement.textContent = topicName; // Set topic name immediately

    updateUIState('loadingCards'); // Show loading state

    if (!topicId) {
        console.error("No Topic ID provided.");
        updateUIState('welcome'); // Revert to welcome if no ID
        return;
    }

    try {
        const cards = await apiRequest(`/cards/topic/${topicId}`);
        currentCards = Array.isArray(cards) ? cards : []; // Ensure it's an array

        if (currentCards.length > 0) {
            updateUIState('displayingCards');
            displayCard(currentCards[0], 0, currentCards.length);
            // loadProgressForTopic(topicId); // Load progress after cards are loaded
        } else {
            updateUIState('noCards');
        }
        // Reset flip state
        cardElement.classList.remove('flipped');
        // Reset study mode visual
        toggleStudyMode(studyModeToggle.checked, true); // Force UI update for mode

    } catch (error) {
        console.error('Error loading cards:', error);
        updateUIState('noCards'); // Show no cards message on error
    }
}

function displayCard(card, index, total) {
    if (!card) {
        console.warn("displayCard called with undefined card");
        updateUIState('noCards');
        return;
    }

    currentDisplayedCard = card; // Store the current card object

    // Update both Flip and Study mode cards
    cardQuestion.textContent = card.question || '[No Question]';
    cardAnswer.textContent = card.answer || '[No Answer]';
    studyCardQuestion.textContent = card.question || '[No Question]';
    studyCardAnswer.textContent = card.answer || '[No Answer]';

    cardCounter.textContent = `Card ${index + 1} of ${total}`;
    cardElement.classList.remove('flipped'); // Ensure card starts unflipped

    // Update button states
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;

    // Reset AI explanation area when displaying a new card
    aiExplanationContainer.classList.add('hidden');
    aiExplanationText.textContent = '';
}

function updateUIState(state, message = '') {
    // Hide all potentially visible containers first
    welcomeContainer.classList.add('hidden');
    flashcardContainer.classList.add('hidden');
    progressContainer.classList.add('hidden');
    noCardsMessage.classList.add('hidden');
    cardNavigation.classList.add('hidden');
    cardActions.classList.add('hidden');
    flipCardContainer.classList.add('hidden');
    studyCardContainer.classList.add('hidden');
    editCardBtn.classList.add('hidden');
    deleteCardBtn.classList.add('hidden');
    // Hide buttons within noCardsMessage by default
    const noCardsPara = noCardsMessage.querySelector('p'); // Get the paragraph
    const addFirstBtn = document.getElementById('add-first-card-btn');
    const generateLinkAlt = document.getElementById('generate-cards-link-alt');
    const orSpan = noCardsMessage.querySelector('span.mx-2'); // Get the 'or' span
    if (addFirstBtn) addFirstBtn.classList.add('hidden');
    if (generateLinkAlt) generateLinkAlt.classList.add('hidden');
    if (orSpan) orSpan.classList.add('hidden');

    switch (state) {
        case 'welcome':
            welcomeContainer.classList.remove('hidden');
            break;
        case 'loadingCards':
            flashcardContainer.classList.remove('hidden');
             // Optionally show a loading spinner here
             cardQuestion.textContent = "Loading...";
             cardAnswer.textContent = "Loading...";
             studyCardQuestion.textContent = "Loading...";
             studyCardAnswer.textContent = "Loading...";
             cardCounter.textContent = '';
             cardActions.classList.remove('hidden'); // Show Add button even while loading
             break;
        case 'displayingCards':
            flashcardContainer.classList.remove('hidden');
            cardNavigation.classList.remove('hidden');
            cardActions.classList.remove('hidden');
            editCardBtn.classList.remove('hidden'); // Show edit/delete only if cards exist
            deleteCardBtn.classList.remove('hidden');
             // Decide which card mode container to show based on toggle
            toggleStudyMode(studyModeToggle.checked, true); // Update visibility based on current mode
            // progressContainer.classList.remove('hidden'); // Show progress
            break;
        case 'noCards':
            flashcardContainer.classList.remove('hidden');
            noCardsMessage.classList.remove('hidden');
            if (noCardsPara) noCardsPara.textContent = 'No cards available for this topic.'; // Set default text
            if (addFirstBtn) addFirstBtn.classList.remove('hidden'); // Show buttons
            if (generateLinkAlt) generateLinkAlt.classList.remove('hidden');
            if (orSpan) orSpan.classList.remove('hidden');
            cardActions.classList.remove('hidden'); // Keep Add button visible
            cardCounter.textContent = 'Card 0 of 0';
            break;
        case 'topicFinished': // NEW STATE
            flashcardContainer.classList.remove('hidden');
            noCardsMessage.classList.remove('hidden');
            if (noCardsPara) noCardsPara.textContent = message; // Display completion message
            // Keep buttons hidden (default behavior)
            cardActions.classList.add('hidden'); // Hide card actions too
            cardCounter.textContent = ''; // Clear card counter
            break;
        // Add other states if needed (e.g., 'errorLoading')
    }
}


function nextCard() {
    if (currentCardIndex < currentCards.length - 1) {
        currentCardIndex++;
        displayCard(currentCards[currentCardIndex], currentCardIndex, currentCards.length);
    }
}

function prevCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        displayCard(currentCards[currentCardIndex], currentCardIndex, currentCards.length);
    }
}

function flipCard() {
     // Only flip if in flip mode
     if (!studyModeToggle.checked) {
         cardElement.classList.toggle('flipped');
     }
}

// Modified to prevent accidental flips and update UI state
function toggleStudyMode(isStudyMode, forceUpdate = false) {
    // If not forcing update, read from checkbox
    const mode = forceUpdate ? isStudyMode : studyModeToggle.checked;

     if (mode) { // Study Mode Active
         flipCardContainer.classList.add('hidden');
         if (currentCards.length > 0) { // Only show if cards exist
             studyCardContainer.classList.remove('hidden');
         }
     } else { // Flip Mode Active
         studyCardContainer.classList.add('hidden');
         if (currentCards.length > 0) { // Only show if cards exist
             flipCardContainer.classList.remove('hidden');
             cardElement.classList.remove('flipped'); // Ensure flip card resets
         }
     }
     // Make sure checkbox reflects state if forced
     if (forceUpdate && studyModeToggle.checked !== mode) {
        studyModeToggle.checked = mode;
     }
}

// --- Add/Edit/Delete Card Functions ---
function openAddCardModal() {
    if (!currentTopicId) {
        console.error("Please select a topic first.");
        return;
    }
    addCardForm.reset();
    clearModalError(addCardError);
    toggleModal(addCardModal, true);
    addCardQuestionInput.focus();
}

function closeAddCardModal() {
    toggleModal(addCardModal, false);
}

function openEditCardModal() {
    if (!currentDisplayedCard) {
        console.error('No card selected to edit.');
        return;
    }
    editCardForm.reset();
    editCardIdInput.value = currentDisplayedCard._id;
    editCardQuestionInput.value = currentDisplayedCard.question;
    editCardAnswerInput.value = currentDisplayedCard.answer;
    clearModalError(editCardError);
    toggleModal(editCardModal, true);
     editCardQuestionInput.focus();
}

function closeEditCardModal() {
    toggleModal(editCardModal, false);
}

async function handleAddCardSubmit(event) {
    event.preventDefault();
    const question = addCardQuestionInput.value.trim();
    const answer = addCardAnswerInput.value.trim();

    clearModalError(addCardError); // Clear previous errors

    if (!question || !answer) {
        displayModalError(addCardError, 'Question and Answer cannot be empty.');
        return;
    }

    if (!currentTopicId) {
         console.error('No topic selected.');
         return;
    }

    toggleButtonLoading(confirmAddCardBtn, true, 'Adding...');

    try {
        // API expects topicId, question, answer
        const newCard = await apiRequest('/cards', 'POST', { topicId: currentTopicId, question, answer });
        console.log('Card added successfully!');
        closeAddCardModal();

        // Efficiently add to local array and refresh UI
        currentCards.push(newCard); // Add to the end
        currentCardIndex = currentCards.length - 1; // Go to the new card
        updateUIState('displayingCards');
        displayCard(newCard, currentCardIndex, currentCards.length);

    } catch (error) {
        displayModalError(addCardError, error.message || 'Failed to add card.');
    } finally {
        toggleButtonLoading(confirmAddCardBtn, false);
    }
}

async function handleEditCardSubmit(event) {
    event.preventDefault();
    const cardId = editCardIdInput.value;
    const question = editCardQuestionInput.value.trim();
    const answer = editCardAnswerInput.value.trim();

    clearModalError(editCardError);

    if (!question || !answer) {
        displayModalError(editCardError, 'Question and Answer cannot be empty.');
        return;
    }

    if (!cardId) {
        console.error('Card ID is missing. Cannot update.');
        return;
    }

    toggleButtonLoading(confirmEditCardBtn, true, 'Saving...');

    try {
        // API expects question, answer in body for PUT /api/cards/:id
        const updatedCard = await apiRequest(`/cards/${cardId}`, 'PUT', { question, answer });
        console.log('Card updated successfully!');
        closeEditCardModal();

        // Update the card in the local array
        const indexToUpdate = currentCards.findIndex(c => c._id === cardId);
        if (indexToUpdate !== -1) {
            // Merge updates, assuming API returns the full updated card
            currentCards[indexToUpdate] = { ...currentCards[indexToUpdate], ...updatedCard, question, answer }; // Ensure local fields are updated even if PUT returns no body
            currentCardIndex = indexToUpdate; // Stay on the edited card
            updateUIState('displayingCards');
            displayCard(currentCards[currentCardIndex], currentCardIndex, currentCards.length);
        } else {
            // Card not found locally, perhaps reload everything as a fallback
            console.warn("Edited card not found in local array, reloading topic.");
            loadCardsForTopic(currentTopicId, currentTopicElement.textContent);
        }

    } catch (error) {
         displayModalError(editCardError, error.message || 'Failed to update card.');
    } finally {
        toggleButtonLoading(confirmEditCardBtn, false);
    }
}

async function handleDeleteCard() {
    if (!currentDisplayedCard) {
        console.error('No card selected to delete.');
        return;
    }
    const cardId = currentDisplayedCard._id;
    const cardQuestionPreview = currentDisplayedCard.question.substring(0, 30) + (currentDisplayedCard.question.length > 30 ? '...' : '');

    // Use a more robust confirmation later if needed
    if (!confirm(`Are you sure you want to delete the card: "${cardQuestionPreview}"? This cannot be undone.`)) {
        return;
    }

    try {
        await apiRequest(`/cards/${cardId}`, 'DELETE');
        console.log('Card deleted successfully!');

        // Remove card from local array
        const deletedIndex = currentCards.findIndex(c => c._id === cardId);
        if(deletedIndex !== -1) {
            currentCards.splice(deletedIndex, 1);
        }

        // Adjust index and refresh UI
        if (currentCards.length === 0) {
             updateUIState('noCards');
             currentDisplayedCard = null; // Clear selection
        } else {
            // Show previous card or first card if the deleted one was the first/only one left
            currentCardIndex = Math.max(0, deletedIndex - 1); // Go to previous or 0
             updateUIState('displayingCards');
             displayCard(currentCards[currentCardIndex], currentCardIndex, currentCards.length);
        }
    } catch (error) {
        console.error(error.message || 'Failed to delete card.');
    }
}

// --- Progress Management ---
async function loadProgressForTopic(topicId) {
    if (!topicId) return;
    try {
        const progressData = await apiRequest(`/progress/topic/${topicId}`);
        progress = {
            knownCount: progressData.knownCount || 0,
            unknownCount: progressData.unknownCount || 0,
            // knownCardIds: progressData.knownCardIds || [], // Optional: if needed for UI logic
            // unknownCardIds: progressData.unknownCardIds || []
        };
        updateProgressDisplay();
        progressContainer.classList.remove('hidden');
    } catch (error) {
        console.error("Error loading progress:", error);
        // Reset progress on error
        progress = { knownCount: 0, unknownCount: 0 };
        updateProgressDisplay();
        // Decide if progress container should be hidden on error
        // progressContainer.classList.add('hidden');
    }
}

function updateProgressDisplay() {
    if (progressContainer.classList.contains('hidden')) return;

    const total = progress.knownCount + progress.unknownCount;
    // Calculate percentage based only on cards that have been marked
    const markedTotal = currentCards.filter(c => 
        (progress.knownCardIds && progress.knownCardIds.includes(c._id)) || 
        (progress.unknownCardIds && progress.unknownCardIds.includes(c._id))
    ).length;
    // ^^ This requires known/unknownCardIds from backend, let's simplify for now
    // Let's base progress on known/total for now
    const displayTotal = currentCards.length; // Base percentage on total cards in topic
    const percentComplete = displayTotal === 0 ? 0 : Math.round((progress.knownCount / displayTotal) * 100);

    progressBar.style.width = `${percentComplete}%`;
    progressPercentage.textContent = `${percentComplete}%`;
    progressRatio.textContent = `${progress.knownCount}/${displayTotal}`;
}

// *** Function to mark card as known/unknown ***
async function markCard(status) {
    if (!currentDisplayedCard || !currentTopicId) return; // Ensure card and topic are selected

    const cardId = currentDisplayedCard._id;

    try {
        // Send update to backend
        const updatedProgress = await apiRequest(`/progress/topic/${currentTopicId}`, 'POST', {
            cardId: cardId,
            status: status
        });

        // Update local progress state from the response
        progress = {
            knownCount: updatedProgress.knownCount || 0,
            unknownCount: updatedProgress.unknownCount || 0
        };
        updateProgressDisplay(); // Update the progress bar

        const wasLastCard = currentCardIndex === currentCards.length - 1;

        if (!wasLastCard) {
            nextCard();
        } else {
            const totalCards = currentCards.length;
            const percentComplete = totalCards === 0 ? 0 : Math.round((progress.knownCount / totalCards) * 100);
            const completionMessage = `Topic finished! Progress: ${percentComplete}% (${progress.knownCount}/${totalCards} known)`;
            updateUIState('topicFinished', completionMessage);
        }

    } catch (error) {
        console.error("Error marking card:", error);
    }
}


// --- Generator Modal ---
function openGenerateModal(topicName = '') {
    generateTopicInput.value = topicName || ''; // Pre-fill if name provided
    generateCountSelect.value = '10';
    clearModalError(generateError);
    generationProgress.classList.add('hidden');
    toggleModal(generateModal, true);
    generateTopicInput.focus();
}

function closeGenerateModal() {
    toggleModal(generateModal, false);
}

async function handleGenerateSubmit(event) {
    event.preventDefault();
    const topic = generateTopicInput.value.trim();
    const count = generateCountSelect.value;

    clearModalError(generateError);

    if (!topic) {
        displayModalError(generateError, 'Topic name is required.');
        return;
    }

    toggleButtonLoading(confirmGenerateBtn, true, 'Generating...');
    cancelGenerateBtn.disabled = true; // Disable cancel during generation
    generationProgress.classList.remove('hidden'); // Show progress indicator
    generationProgressBar.style.width = '0%'; // Reset progress bar
    // Simulate progress for better UX (optional)
    let progressInterval = setInterval(() => {
        let currentWidth = parseFloat(generationProgressBar.style.width);
        if (currentWidth < 90) { // Simulate progress up to 90%
            generationProgressBar.style.width = (currentWidth + 5) + '%';
        }
    }, 200);

    try {
        // Call the generate API (returns cards only)
        const generatedData = await apiRequest('/generate', 'POST', { topic, count });

        clearInterval(progressInterval); // Stop simulation
        generationProgressBar.style.width = '100%'; // Mark as complete

        if (!generatedData || !Array.isArray(generatedData.cards) || generatedData.cards.length === 0) {
             throw new Error("AI failed to generate valid cards.");
        }

        // Save the generated cards (posts to /generate/save)
        // Add a small delay before saving to show 100% progress briefly
        await new Promise(resolve => setTimeout(resolve, 300)); 
        
        const saveData = await apiRequest('/generate/save', 'POST', {
            topicName: topic,
            // topicDescription: `Generated cards about ${topic}`, // Optional description
            cards: generatedData.cards
        });

        console.log(saveData.message || `Generated and saved ${generatedData.cards.length} cards for "${topic}"!`);
        closeGenerateModal();
        loadTopics(); // Refresh topics list to include the new one

        // Optionally, load the newly generated topic immediately
        if (saveData.topic && saveData.topic._id) {
            loadCardsForTopic(saveData.topic._id, saveData.topic.name);
        }

    } catch (error) {
        clearInterval(progressInterval); // Stop simulation on error
        displayModalError(generateError, error.message || 'Failed to generate cards.');
        generationProgress.classList.add('hidden'); // Hide progress on error
    } finally {
        toggleButtonLoading(confirmGenerateBtn, false);
        cancelGenerateBtn.disabled = false; // Re-enable cancel
         // Reset progress bar after a short delay if modal is not closed automatically
        setTimeout(() => {
            generationProgressBar.style.width = '0%'; 
            generationProgress.classList.add('hidden'); 
        }, 1000); 
    }
}

// *** Function to handle AI Explanation Request ***
async function handleExplainAI() {
    if (!currentDisplayedCard) {
        console.error("Cannot explain: No card selected.");
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
             aiExplanationText.textContent = 'Could not get an explanation.';
             console.error("Failed to get explanation from AI.");
        }
    } catch (error) {
        aiExplanationText.textContent = `Error: ${error.message}`;
        console.error(`Failed to get explanation: ${error.message}`);
    } finally {
        // Удаляем класс подсветки после завершения запроса
        setTimeout(() => {
            explainAiBtn.classList.remove('active');
            explainAiBtn.classList.remove('text-yellow-600');
            explainAiBtn.classList.remove('bg-yellow-100');
        }, 1000); // Оставляем подсветку на 1 секунду после завершения для лучшего UX
    }
}

// --- Initialization ---
function initializeDashboard() {
    // Basic Setup
    checkAuth(); // Ensure user is logged in

    // Event Listeners - Logout
    logoutBtn.addEventListener('click', logout);

    // Event Listeners - Topics
    addTopicBtn.addEventListener('click', openAddTopicModal);
    welcomeAddTopicBtn.addEventListener('click', openAddTopicModal); // Button on welcome screen
    cancelAddTopicBtn.addEventListener('click', closeAddTopicModal);
    addTopicForm.addEventListener('submit', handleAddTopicSubmit); // NEW listener on form

    // Event Listeners - Card Generation
    generateBtn.addEventListener('click', () => openGenerateModal()); // Nav button
    welcomeGenerateBtn.addEventListener('click', () => openGenerateModal()); // Welcome screen button
    generateCardsLinkAlt.addEventListener('click', () => openGenerateModal(currentTopicElement.textContent)); // Link in no-cards message
    cancelGenerateBtn.addEventListener('click', closeGenerateModal);
    generateForm.addEventListener('submit', handleGenerateSubmit); // NEW listener on form

    // Event Listeners - Flashcard Interaction
    flipCardContainer.addEventListener('click', (event) => {
         // Only flip if in flip mode and clicking the card itself
         if (!studyModeToggle.checked && 
             (event.target === cardFront || event.target === cardBack || 
             event.target.closest('.card-front') || event.target.closest('.card-back'))) {
              // Prevent marking when clicking to flip initially
             if (!cardElement.classList.contains('flipped')) {
                  flipCard();
             }
         }
    });
    
    // *** Add listener specifically for marking on the card back ***
    cardBack.addEventListener('click', function(e) {
        // Only trigger if in flip mode AND card is actually flipped
        if (studyModeToggle.checked || !cardElement.classList.contains('flipped')) return; 
        
        // Ignore clicks directly on the AI explanation button
        if (e.target.closest('#explain-ai-btn')) return;
        
        const rect = cardBack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const status = (x < rect.width / 2) ? 'unknown' : 'known';
        const flashClass = (status === 'unknown') ? 'flash-red' : 'flash-green';
        
        // Add visual flash to the ENTIRE card back
        cardBack.classList.add(flashClass);
        setTimeout(() => cardBack.classList.remove(flashClass), 300); // Remove class after animation
        
        // Mark card and potentially advance
        markCard(status);
    });
    
    // *** Add listener for marking in Study Mode ***
    studyCardContainer.addEventListener('click', function(e) {
        // Only trigger if in study mode
        if (!studyModeToggle.checked) return; 
        
        const innerCard = e.target.closest('.study-card-inner');
        if (!innerCard) return;
        
        const rect = innerCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const isLeftSide = x < rect.width / 2;
        
        // Определяем, на какой стороне был клик и какой элемент будем подсвечивать
        if (isLeftSide) {
            // Clicking on question side (left) - mark as unknown (red)
            // Подсвечиваем всю левую половину карточки
            const questionSide = innerCard.querySelector('.study-card-question');
            questionSide.classList.add('flash-red');
            setTimeout(() => questionSide.classList.remove('flash-red'), 300);
            markCard('unknown');
        } else {
            // Clicking on answer side (right) - mark as known (green)
            // Подсвечиваем всю правую половину карточки
            const answerSide = innerCard.querySelector('.study-card-answer');
            answerSide.classList.add('flash-green');
            setTimeout(() => answerSide.classList.remove('flash-green'), 300);
            markCard('known');
        }
    });
    

    nextBtn.addEventListener('click', nextCard);
    prevBtn.addEventListener('click', prevCard);
    studyModeToggle.addEventListener('change', () => toggleStudyMode(studyModeToggle.checked, true)); // Update UI on change

    // Event Listeners - Add/Edit/Delete Card Modals & Actions
    addCardBtn.addEventListener('click', openAddCardModal); // Button in card actions
    addFirstCardBtn.addEventListener('click', openAddCardModal); // Button in no-cards message
    cancelAddCardBtn.addEventListener('click', closeAddCardModal);
    addCardForm.addEventListener('submit', handleAddCardSubmit);

    editCardBtn.addEventListener('click', openEditCardModal);
    cancelEditCardBtn.addEventListener('click', closeEditCardModal);
    editCardForm.addEventListener('submit', handleEditCardSubmit);

    deleteCardBtn.addEventListener('click', handleDeleteCard);

    // *** Add Event Listener for AI Explain Button ***
    explainAiBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent click from bubbling up to cardBack marking listener
        handleExplainAI();
    });

    // Initial Load
    loadTopics(); // Load topics when dashboard initializes
    updateUIState('welcome'); // Start with the welcome message visible
}

// Initialize the dashboard when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeDashboard); 