let generatedCardsData = [];

const notyf = new Notyf({
    duration: 3000, 
    position: { x: 'right', y: 'top' }, 
    dismissible: true 
});


async function saveGeneratedCards() {
    const topicName = document.getElementById('generator-topic').value.trim();
    const cardsToSave = [];

    document.querySelectorAll('#generated-cards-list .generated-card-item').forEach(item => {
        const question = item.querySelector('textarea[data-field="question"]').value;
        const answer = item.querySelector('textarea[data-field="answer"]').value;
        cardsToSave.push({ question, answer });
    });

    if (cardsToSave.length === 0) {
        notyf.error('No cards to save.');
        return;
    }

    try {
        const data = await apiRequest('/api/generate/save', 'POST', {
            topicName,
            cards: cardsToSave
        });

        if (data && data.message) {
            notyf.success(data.message);
            clearGeneratedCardsPreview();
            loadTopics();
        } else {
             notyf.error(data.message || 'Failed to save cards. Unknown error.');
        }
    } catch (error) {
        console.error('Error saving cards:', error);
        notyf.error(`Error saving cards: ${error.message || 'Network error'}`);
    }
}