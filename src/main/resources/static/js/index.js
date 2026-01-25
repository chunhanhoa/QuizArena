function createWithAI() {
    const topic = document.getElementById('topicInput').value;
    if (!topic) {
        alert("Vui lòng nhập chủ đề!");
        return;
    }
    
    // Redirect to create page with topic or open modal
    console.log("Creating quiz for topic:", topic);
    window.location.href = `/create.html?topic=${encodeURIComponent(topic)}`;
}

// Future: Initialize animations or check auth status
document.addEventListener('DOMContentLoaded', () => {
    console.log("Quiz Arena initialized.");
});
