let currentQuestionIndex = 0;
let questions = [];
let score = 0;
let timer = null;
let startTime = 0;
let totalTime = 10; // Cố định 10s theo yêu cầu
let streak = 0;
let stompClient = null;
let roomPin = null;
let userId = localStorage.getItem('userId');
let isFrozen = false;
let isDouble = false;
let hasAnswered = false;
let gameStarted = false;

document.addEventListener('DOMContentLoaded', () => {
    const savedQuiz = localStorage.getItem('currentQuiz');
    const params = new URLSearchParams(window.location.search);
    roomPin = params.get('pin');

    if (savedQuiz) {
        try {
            questions = JSON.parse(savedQuiz).questions;
        } catch (e) {
            console.error("Error parsing quiz", e);
            alert("Lỗi tải dữ liệu câu hỏi.");
            window.location.href = 'index.html';
            return;
        }
    } else {
        alert("Không tìm thấy dữ liệu trận đấu.");
        window.location.href = 'index.html';
        return;
    }

    if (roomPin) {
        connectToRoom(roomPin);
    } else {
        loadQuestion();
    }
});

function connectToRoom(pin) {
    const socket = new SockJS('/ws-quiz');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, (frame) => {
        stompClient.subscribe(`/topic/room/${pin}`, (msg) => {
            const room = JSON.parse(msg.body);
            updateLeaderboardUI(room.players);
            
            // Đồng bộ câu hỏi và trạng thái game
            if (room.status === 'STARTED') {
                if (currentQuestionIndex !== room.currentQuestionIndex || !gameStarted) {
                    currentQuestionIndex = room.currentQuestionIndex;
                    gameStarted = true;
                    loadQuestion();
                }

                // Kiểm tra xem mình có bị cấm chơi lượt này không
                if (room.frozenUserIds && room.frozenUserIds.includes(userId) && !hasAnswered) {
                    showFrozenOverlay();
                }
            } else if (room.status === 'FINISHED') {
                showResults();
            }
        });
    });
}

function showFrozenOverlay() {
    hasAnswered = true; // Coi như đã trả lời (không cho nhấn nữa)
    const grid = document.getElementById('optionsGrid');
    const buttons = grid.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);
    
    document.getElementById('questionText').innerHTML = "<span style='color: #60a5fa;'>❄️ BẠN ĐÃ BỊ ĐÓNG BĂNG! (Mất lượt này)</span>";
}

function updateLeaderboardUI(players) {
    const list = document.getElementById('leaderboardList');
    if (!list) return;
    const sorted = [...players].sort((a, b) => b.score - a.score);
    list.innerHTML = sorted.map((p, idx) => `
        <div class="leaderboard-item ${p.userId === userId ? 'me' : ''}">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="rank">${idx + 1}</span>
                <span style="font-weight: 600;">${p.username}</span>
            </div>
            <span style="font-weight: 800; color: #f9c46b;">${p.score}</span>
        </div>
    `).join('');
}

function syncScoreWithServer() {
    if (!roomPin || !userId) return;
    fetch(`/api/rooms/${roomPin}/score?userId=${userId}&score=${score}`, { method: 'POST' });
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        if (!roomPin) showResults();
        return;
    }

    hasAnswered = false;
    const q = questions[currentQuestionIndex];
    document.getElementById('questionText').innerText = q.content;
    
    const expBox = document.getElementById('explanationBox');
    if (expBox) expBox.style.display = 'none';

    const imgElement = document.getElementById('questionImage');
    if (imgElement) {
        imgElement.style.backgroundImage = `url('${q.imageUrl || 'https://placehold.co/600x400?text=Question'}')`;
    }

    const grid = document.getElementById('optionsGrid');
    grid.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        const colorClasses = ['option-a', 'option-b', 'option-c', 'option-d'];
        btn.className = `game-option ${colorClasses[idx % 4]}`;
        btn.innerHTML = `${opt.text}`;
        btn.onclick = () => handleAnswer(opt, btn);
        grid.appendChild(btn);
    });

    startTimer(10); // Mỗi câu 10s
}

function startTimer(seconds) {
    const bar = document.getElementById('timerProgress');
    bar.style.transition = 'none';
    bar.style.width = '100%';
    
    if (timer) clearInterval(timer);
    
    startTime = Date.now();
    bar.offsetHeight; // force reflow
    bar.style.transition = `width ${seconds}s linear`;
    bar.style.width = '0%';

    timer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= seconds) {
            clearInterval(timer);
            if (!hasAnswered) handleAnswer(null); // Timeout
        }
    }, 100);
}

function usePowerup(type) {
    const btn = event.currentTarget;
    if (btn.classList.contains('used') || hasAnswered) return;

    if (type === '5050') {
        const q = questions[currentQuestionIndex];
        const grid = document.getElementById('optionsGrid');
        const buttons = Array.from(grid.querySelectorAll('button'));
        let removed = 0;
        buttons.forEach((b, idx) => {
            if (!q.options[idx].isCorrect && removed < 2) {
                b.style.visibility = 'hidden';
                removed++;
            }
        });
    } else if (type === 'freeze') {
        if (roomPin) {
            fetch(`/api/rooms/${roomPin}/powerup/freeze?userId=${userId}`, { method: 'POST' });
        } else {
            alert("Tính năng này chỉ dùng trong chế độ Multiplayer!");
            return;
        }
    } else if (type === 'x2') {
        isDouble = true;
    }

    btn.style.opacity = '0.3';
    btn.classList.add('used');
}

function handleAnswer(option, btn) {
    if (hasAnswered) return;
    hasAnswered = true;

    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = Math.max(0, 10 - elapsed);

    const grid = document.getElementById('optionsGrid');
    const buttons = grid.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);

    const q = questions[currentQuestionIndex];
    const isCorrect = option && option.isCorrect;
    
    if (isCorrect) {
        btn.classList.add('correct');
        streak++;
        let timeBonus = Math.round((remaining / 10) * 100);
        let earnedScore = Math.max(10, timeBonus);
        if (isDouble) { earnedScore *= 2; isDouble = false; }
        score += earnedScore;
        document.getElementById('myScore').innerText = score;
        showScorePopup(earnedScore, streak > 1 ? `Streak x${streak}` : "");
        syncScoreWithServer();
    } else {
        streak = 0; 
        if (btn) btn.classList.add('wrong');
        buttons.forEach((b, idx) => {
            if (q.options[idx].isCorrect) b.classList.add('correct');
        });
    }

    if (q.explanation) {
        const expBox = document.getElementById('explanationBox');
        if (expBox) {
            expBox.innerText = "💡 " + q.explanation;
            expBox.style.display = 'block';
        }
    }

    // Nếu không phải multiplayer, tự động qua câu sau
    if (!roomPin) {
        setTimeout(() => {
            currentQuestionIndex++;
            loadQuestion();
        }, 2000);
    }
}

function showScorePopup(points, streakText) {
    const popup = document.getElementById('scorePopup');
    popup.innerHTML = `+${points}${streakText ? `<br><small style="font-size: 0.4em; opacity: 0.8;">${streakText}</small>` : ""}`;
    popup.style.animation = 'none';
    popup.offsetHeight; 
    popup.style.animation = 'scoreAnim 1s ease-out forwards';
}

function showResults() {
    clearInterval(timer);
    if (roomPin) {
        window.location.href = `results.html?pin=${roomPin}`;
    } else {
        alert(`Chúc mừng! Bạn đã hoàn thành với tổng số điểm: ${score}`);
        window.location.href = 'index.html';
    }
}




