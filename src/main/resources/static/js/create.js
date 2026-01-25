document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const topic = urlParams.get('topic');
    
    if (!topic) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('pageTitle').innerText = `Chủ đề: ${topic}`;
    generateAIQuestions(topic);
});

async function generateAIQuestions(topic) {
    try {
        const response = await fetch(`/api/quizzes/generate?topic=${encodeURIComponent(topic)}&count=5`, {
            method: 'POST'
        });

        if (!response.ok) throw new Error("Không thể gọi API");

        const questions = await response.json();
        displayQuestions(questions);
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Có lỗi xảy ra khi tạo câu hỏi. Vui lòng thử lại!");
        window.location.href = 'index.html';
    }
}

function displayQuestions(questions) {
    const loadingView = document.getElementById('loadingView');
    const resultView = document.getElementById('resultView');
    const list = document.getElementById('questionsList');

    loadingView.style.display = 'none';
    resultView.style.display = 'block';
    list.innerHTML = '';

    questions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'glass question-card';
        card.style.animationDelay = `${index * 0.1}s`;

        let optionsHtml = '';
        q.options.forEach(opt => {
            optionsHtml += `
                <div class="option-item ${opt.isCorrect ? 'correct' : ''}">
                    <span>${opt.text}</span>
                    ${opt.isCorrect ? '<span style="color: var(--secondary)">✓</span>' : ''}
                </div>
            `;
        });

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <h3 style="flex: 1;">Câu ${index + 1}: ${q.content}</h3>
                <span class="badge" style="background: var(--glass-border); color: var(--text-muted);">${q.timeLimit}s</span>
            </div>
            <div class="options-list">
                ${optionsHtml}
            </div>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-muted);">
                <strong>Giải thích:</strong> ${q.explanation}
            </p>
        `;
        list.appendChild(card);
    });
}

function saveQuiz() {
    alert("Tính năng lưu đang được phát triển. Bạn có thể xem kết quả ngay tại đây!");
}
