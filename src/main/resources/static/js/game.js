// ─────────────────────────────────────────────────────────────────────────────
// GAME.JS - LOGIC PHÍA CLIENT CHO CHẾ ĐỘ MULTIPLAYER & SOLO
//
// Luồng chính:
//   1. Đọc câu hỏi từ localStorage (đã lưu khi vào phòng chờ)
//   2. Nếu có PIN (multiplayer): kết nối WebSocket, đồng bộ trạng thái từ server
//   3. Nếu không có PIN (solo): chạy độc lập, tự quản lý luồng câu hỏi
// ─────────────────────────────────────────────────────────────────────────────

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
let hasAnswered = false; // ANTI-CHEAT: cờ ngăn trả lời 2 lần trong cùng 1 câu
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
        connectToRoom(roomPin); // Multiplayer: kết nối WebSocket
    } else {
        loadQuestion(); // Solo: bắt đầu câu hỏi ngay
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// KẾT NỐI WEBSOCKET & XỬ LÝ RECONNECT
//
// Client subscribe kênh /topic/room/{pin} để nhận realtime từ server.
//
// Xử lý tình huống RECONNECT (load lại trang / vào lại sau khi mất mạng):
//   - Server broadcast trạng thái phòng liên tục mỗi khi có event.
//   - Client nhận message đầu tiên → so sánh currentQuestionIndex với server
//   - Nếu lệch (do client vắng mặt 1 hoặc nhiều câu) → client tự nhảy đến
//     đúng câu hỏi đang diễn ra (dòng: currentQuestionIndex = room.currentQuestionIndex)
//   - Điều này đồng bộ lại client mà không cần server làm gì thêm.
// ─────────────────────────────────────────────────────────────────────────────
function connectToRoom(pin) {
    const socket = new SockJS('/ws-quiz');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, (frame) => {
        stompClient.subscribe(`/topic/room/${pin}`, (msg) => {
            const room = JSON.parse(msg.body);

            // Cập nhật leaderboard realtime cho tất cả người chơi
            updateLeaderboardUI(room.players);
            
            // Đồng bộ câu hỏi và trạng thái game
            if (room.status === 'STARTED') {
                // Nếu client lệch câu (do vừa reconnect) → nhảy đến câu đúng
                if (currentQuestionIndex !== room.currentQuestionIndex || !gameStarted) {
                    currentQuestionIndex = room.currentQuestionIndex;
                    gameStarted = true;
                    loadQuestion();
                }

                // ANTI-CHEAT: Kiểm tra xem người chơi có bị ĐÓNG BĂNG lượt này không
                // frozenUserIds được server set khi đối thủ dùng power-up Freeze
                if (room.frozenUserIds && room.frozenUserIds.includes(userId) && !hasAnswered) {
                    showFrozenOverlay(); // Disable toàn bộ nút trả lời
                }
            } else if (room.status === 'FINISHED') {
                showResults(); // Tự động chuyển sang trang kết quả
            }
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// ANTI-CHEAT: HIỂN THỊ TRẠNG THÁI BỊ ĐÓNG BĂNG
// Khi bị freeze: coi như đã trả lời (hasAnswered=true) ngăn click,
// disable toàn bộ nút, và thông báo cho người chơi.
// ─────────────────────────────────────────────────────────────────────────────
function showFrozenOverlay() {
    hasAnswered = true; // Coi như đã trả lời (không cho nhấn nữa)
    const grid = document.getElementById('optionsGrid');
    const buttons = grid.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);
    
    document.getElementById('questionText').innerHTML = "<span style='color: #60a5fa;'>❄️ BẠN ĐÃ BỊ ĐÓNG BĂNG! (Mất lượt này)</span>";
}

// Cập nhật bảng xếp hạng realtime dựa trên dữ liệu từ server
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

// Gửi điểm hiện tại lên server để lưu DB và broadcast leaderboard
function syncScoreWithServer() {
    if (!roomPin || !userId) return;
    fetch(`/api/rooms/${roomPin}/score?userId=${userId}&score=${score}`, { method: 'POST' });
}

// Hiển thị câu hỏi hiện tại và khởi động timer 10 giây
function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        if (!roomPin) showResults();
        return;
    }

    // Reset cờ đã trả lời khi bắt đầu câu mới
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

// ─────────────────────────────────────────────────────────────────────────────
// TIMER PHÍA CLIENT: CHỈ DÙNG ĐỂ HIỂN THỊ & AUTO-SUBMIT KHI HẾT GIỜ
//
// Lưu ý: Timer này KHÔNG kiểm soát luồng game trong multiplayer.
// Luồng game được server điều khiển qua scheduleNextTurn().
// Timer client chỉ xử lý việc tự động gọi handleAnswer(null) khi hết 10s
// trong trường hợp người chơi không chọn đáp án.
// ─────────────────────────────────────────────────────────────────────────────
function startTimer(seconds) {
    const bar = document.getElementById('timerProgress');
    bar.style.transition = 'none';
    bar.style.width = '100%';
    
    if (timer) clearInterval(timer);
    
    startTime = Date.now();
    bar.offsetHeight; // force reflow để animation CSS reset đúng
    bar.style.transition = `width ${seconds}s linear`;
    bar.style.width = '0%';

    timer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= seconds) {
            clearInterval(timer);
            if (!hasAnswered) handleAnswer(null); // Tự động submit khi hết giờ (không tính điểm)
        }
    }, 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// POWER-UP: 50/50, FREEZE (ĐÓNG BĂNG ĐỐI THỦ), X2 ĐIỂM
// - 50/50: Ẩn 2 đáp án sai (xử lý hoàn toàn client-side)
// - Freeze: Gửi request lên server → server chọn đối thủ → broadcast frozenUserIds
// - X2: Đặt cờ isDouble=true → khi trả lời đúng điểm nhân đôi
// ─────────────────────────────────────────────────────────────────────────────
function usePowerup(type) {
    const btn = event.currentTarget;
    // ANTI-CHEAT: Mỗi power-up chỉ dùng 1 lần (class 'used') và không dùng sau khi đã trả lời
    if (btn.classList.contains('used') || hasAnswered) return;

    if (type === '5050') {
        const q = questions[currentQuestionIndex];
        const grid = document.getElementById('optionsGrid');
        const buttons = Array.from(grid.querySelectorAll('button'));
        let removed = 0;
        // Ẩn đúng 2 đáp án sai (giữ lại đáp án đúng)
        buttons.forEach((b, idx) => {
            if (!q.options[idx].isCorrect && removed < 2) {
                b.style.visibility = 'hidden';
                removed++;
            }
        });
    } else if (type === 'freeze') {
        if (roomPin) {
            // Gửi lên server để chọn ngẫu nhiên đối thủ bị đóng băng
            fetch(`/api/rooms/${roomPin}/powerup/freeze?userId=${userId}`, { method: 'POST' });
        } else {
            alert("Tính năng này chỉ dùng trong chế độ Multiplayer!");
            return;
        }
    } else if (type === 'x2') {
        isDouble = true; // Bật cờ x2 điểm cho lần trả lời tiếp theo
    }

    btn.style.opacity = '0.3';
    btn.classList.add('used'); // Đánh dấu đã dùng, ngăn dùng lại
}

// ─────────────────────────────────────────────────────────────────────────────
// XỬ LÝ TRẢ LỜI: TÍNH ĐIỂM VÀ ĐỒNG BỘ VỚI SERVER
//
// Công thức điểm: dựa trên thời gian còn lại (trả lời nhanh → điểm cao hơn)
//   earnedScore = (remaining / 10) * 100, tối thiểu 10 điểm
//   Nếu đang dùng x2 → nhân đôi kết quả
//
// ANTI-CHEAT: hasAnswered=true ngay đầu hàm ngăn click nhiều lần.
// Server là nơi lưu điểm cuối cùng, client không thể tự sửa điểm trực tiếp.
// ─────────────────────────────────────────────────────────────────────────────
function handleAnswer(option, btn) {
    // ANTI-CHEAT: Ngăn trả lời lần 2 trong cùng 1 câu
    if (hasAnswered) return;
    hasAnswered = true;

    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = Math.max(0, 10 - elapsed); // Thời gian còn lại khi bấm

    const grid = document.getElementById('optionsGrid');
    const buttons = grid.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true); // Disable tất cả nút sau khi chọn

    const q = questions[currentQuestionIndex];
    const isCorrect = option && option.isCorrect;
    
    if (isCorrect) {
        btn.classList.add('correct');
        streak++;
        // Tính điểm: tỷ lệ thời gian còn lại, tối thiểu 10 điểm
        let timeBonus = Math.round((remaining / 10) * 100);
        let earnedScore = Math.max(10, timeBonus);
        if (isDouble) { earnedScore *= 2; isDouble = false; } // Áp dụng x2 nếu đang dùng
        score += earnedScore;
        document.getElementById('myScore').innerText = score;
        showScorePopup(earnedScore, streak > 1 ? `Streak x${streak}` : "");
        syncScoreWithServer(); // Gửi điểm lên server để lưu và broadcast leaderboard
    } else {
        streak = 0; 
        if (btn) btn.classList.add('wrong');
        // Hiển thị đáp án đúng cho mọi nút
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

    // Solo mode: tự động chuyển câu sau 2 giây
    // Multiplayer: server điều khiển chuyển câu qua WebSocket broadcast
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

// Kết thúc game: chuyển sang trang kết quả (multiplayer) hoặc alert (solo)
function showResults() {
    clearInterval(timer);
    if (roomPin) {
        window.location.href = `results.html?pin=${roomPin}`;
    } else {
        alert(`Chúc mừng! Bạn đã hoàn thành với tổng số điểm: ${score}`);
        window.location.href = 'index.html';
    }
}
