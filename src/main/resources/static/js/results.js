document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const pin = params.get('pin');

    if (pin) {
        fetchRoomResults(pin);
    } else {
        window.location.href = 'index.html';
    }
});

async function fetchRoomResults(pin) {
    try {
        const res = await fetch(`/api/rooms/${pin}`);
        const room = await res.json();
        renderResults(room.players);
        localStorage.setItem('currentRoom', JSON.stringify(room));
    } catch (e) {
        console.error(e);
    }
}

function renderResults(players) {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    
    // Podium
    const podiumDiv = document.getElementById('podium');
    podiumDiv.innerHTML = '';

    const positions = ['second', 'first', 'third'];
    [1, 0, 2].forEach((idx, i) => {
        const p = sorted[idx];
        if (p) {
            const item = document.createElement('div');
            item.className = `podium-item ${positions[i]}`;
            item.innerHTML = `
                <div class="podium-bar">${idx + 1}</div>
                <div class="player-name">${p.username}</div>
                <div class="player-score">${p.score} pts</div>
            `;
            podiumDiv.appendChild(item);
        }
    });

    // Other Players
    const otherList = document.getElementById('otherList');
    otherList.innerHTML = '<h3 style="margin-bottom: 2rem; opacity: 0.6;">Xếp hạng khác</h3>';
    
    if (sorted.length > 3) {
        sorted.slice(3).forEach((p, idx) => {
            const row = document.createElement('div');
            row.className = 'player-row';
            row.innerHTML = `
                <div style="display: flex; gap: 1rem;">
                    <span style="opacity: 0.5;">#${idx + 4}</span>
                    <span style="font-weight: 700;">${p.username}</span>
                </div>
                <div style="font-weight: 800; color: #f9c46b;">${p.score}</div>
            `;
            otherList.appendChild(row);
        });
    } else if (sorted.length <= 3) {
        otherList.style.display = 'none';
    }
}

function playAgain() {
    const room = JSON.parse(localStorage.getItem('currentRoom'));
    if (room) {
        // Redirtect back to lobby to wait for everyone
        window.location.href = `lobby.html?quizId=${room.quizId}`;
    }
}
