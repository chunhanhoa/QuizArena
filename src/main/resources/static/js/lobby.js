let stompClient = null;
let currentRoom = null;
let userId = localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('userId', userId);

document.addEventListener('DOMContentLoaded', () => {
    console.log("=== THÔNG TIN DEBUG LOBBY ===");
    console.log("User ID hiện tại:", userId);
    
    const params = new URLSearchParams(window.location.search);
    const quizId = params.get('quizId');
    const pin = params.get('pin');
    
    console.log("Quiz ID từ URL:", quizId);
    console.log("PIN từ URL:", pin);

    const savedUsername = localStorage.getItem('username');
    const username = savedUsername || prompt("Nhập tên hiển thị của bạn:") || "Người chơi_" + Math.floor(Math.random()*1000);
    if (!savedUsername) { localStorage.setItem('username', username); }
    console.log("Tên hiển thị:", username);

    if (quizId) {
        console.log("Đang gọi tạo phòng...");
        createRoom(quizId, username);
    } else if (pin) {
        console.log("Đang gọi tham gia phòng...");
        joinRoom(pin, username);
    } else {
        console.warn("Lưu ý: Không tìm thấy Quiz ID hay PIN trong URL.");
    }
});


function createRoom(quizId, username) {
    fetch(`/api/rooms/create?hostId=${userId}&hostName=${username}&quizId=${quizId}`, { method: 'POST' })
        .then(res => res.json())
        .then(room => {
            currentRoom = room;
            // Cập nhật URL để tránh tạo phòng mới khi load lại trang
            window.history.replaceState({}, '', `lobby.html?pin=${room.pin}`);
            setupLobby(room);
        });
}


function joinRoom(pin, username) {
    const cleanPin = pin.replace(/\s/g, ''); // Xóa khoảng trắng nếu có
    fetch(`/api/rooms/${cleanPin}/join?userId=${userId}&username=${username}`, { method: 'POST' })
        .then(res => {
            if (!res.ok) throw new Error("Mã PIN không hợp lệ hoặc phòng đã đóng.");
            return res.json();
        })
        .then(room => {
            currentRoom = room;
            setupLobby(room);
        })
        .catch(err => {
            alert(err.message);
            window.location.href = 'index.html';
        });
}


function setupLobby(room) {
    document.getElementById('roomPin').innerText = room.pin.match(/.{1,3}/g).join(' ');
    
    // QR Code với link tham gia trực tiếp
    const joinLink = `${window.location.origin}/lobby.html?pin=${room.pin}`;
    const qrImg = document.getElementById('roomQr');
    if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinLink)}`;
    
    connect(room.pin);
    renderPlayers(room.players);

    // Show start button only for host
    if (room.hostId === userId) {
        document.getElementById('startBtn').style.display = 'block';
    } else {
        document.getElementById('startBtn').style.display = 'none';
    }
}

function copyInviteLink() {
    if (!currentRoom) return;
    const joinLink = `${window.location.origin}/lobby.html?pin=${currentRoom.pin}`;
    navigator.clipboard.writeText(joinLink).then(() => {
        alert("Đã sao chép link mời vào bộ nhớ tạm!");
    });
}


// Connection Status UI
function updateConnectionStatus(status, color) {
    let indicator = document.getElementById('connStatus');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'connStatus';
        indicator.style = "position: fixed; bottom: 10px; right: 10px; font-size: 0.7rem; padding: 4px 10px; border-radius: 10px; z-index: 1000;";
        document.body.appendChild(indicator);
    }
    indicator.innerText = "WS: " + status;
    indicator.style.background = color;
    indicator.style.color = "white";
}

function connect(pin) {
    updateConnectionStatus("Đang nối...", "#f59e0b");
    console.log("Đang kết nối WebSocket cho phòng PIN:", pin);
    
    const socket = new SockJS('/ws-quiz');
    stompClient = Stomp.over(socket);
    
    // Tắt heartbeat để tránh lỗi timeout trên môi trường local
    stompClient.heartbeat.outgoing = 0;
    stompClient.heartbeat.incoming = 0;

    stompClient.connect({}, (frame) => {
        console.log("WebSocket CONNECTED:", frame);
        updateConnectionStatus("Đã kết nối", "#10b981");
        
        stompClient.subscribe(`/topic/room/${pin}`, (msg) => {
            const room = JSON.parse(msg.body);
            console.log("Nhận cập nhật từ server:", room);
            handleUpdate(room);
        });
    }, (error) => {
        console.error("Lỗi kết nối WebSocket:", error);
        updateConnectionStatus("Lỗi kết nối", "#ef4444");
        setTimeout(() => connect(pin), 3000);
    });
}

function handleUpdate(room) {
    currentRoom = room;
    renderPlayers(room.players);
    if (room.status === 'STARTED') {
        fetchQuizAndStart(room);
    }
}

function renderPlayers(players) {
    const list = document.getElementById('playerList');
    if (!list) return;
    list.innerHTML = '';
    
    // Đảm bảo list không rỗng
    if (!players || players.length === 0) {
        list.innerHTML = "<p>Đang chờ người chơi...</p>";
        return;
    }

    players.forEach(p => {
        const card = document.createElement('div');
        card.className = 'glass player-card';
        card.innerHTML = `
            <div class="player-avatar" style="background: ${getRandomColor()}">${p.username ? p.username[0].toUpperCase() : '?'}</div>
            <p style="font-weight: 600;">${p.username}</p>
        `;
        list.appendChild(card);
    });
}

function getRandomColor() {
    const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
}

async function fetchQuizAndStart(room) {
    try {
        const res = await fetch(`/api/quizzes/${room.quizId}`);
        const quiz = await res.json();
        localStorage.setItem('currentQuiz', JSON.stringify(quiz));
        window.location.href = `game.html?pin=${room.pin}`;
    } catch (e) {
        console.error("Lỗi khi tải Quiz:", e);
        alert("Không thể tải dữ liệu câu hỏi.");
    }
}

function startGame() {
    console.log("=== THÔNG TIN START GAME ===");
    console.log("Phòng hiện tại (currentRoom):", currentRoom);
    console.log("User ID của tôi:", userId);
    
    if (!currentRoom) {
        alert("Lỗi: Không tìm thấy thông tin phòng. Vui lòng thử tải lại trang.");
        return;
    }

    if (currentRoom.hostId !== userId) {
        console.warn("Cảnh báo: Bạn không phải chủ phòng. Host ID là:", currentRoom.hostId);
        alert("Chỉ chủ phòng mới có quyền bắt đầu trận đấu.");
        return;
    }
    
    if (!stompClient || !stompClient.connected) {
        alert("Vui lòng chờ WebSocket kết nối thành công trước khi bắt đầu.");
        return;
    }

    const btn = document.getElementById('startBtn');
    btn.disabled = true;
    btn.innerText = "Đang bắt đầu...";

    fetch(`/api/rooms/${currentRoom.pin}/start`, { method: 'POST' })
        .then(res => {
            if (!res.ok) throw new Error("Server trả về lỗi khi bắt đầu");
            console.log("Lệnh START đã được gửi đi.");
        })
        .catch(err => {
            console.error("Lỗi Start Game:", err);
            alert("Lỗi: " + err.message);
            btn.disabled = false;
            btn.innerText = "Start game";
        });
}




