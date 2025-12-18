// calculator.js

let TOTAL_PLAYERS = 0;

// 입력 필드 동적 생성
function generateInputFields() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    const roundCount = parseInt(document.getElementById('roundCount').value);
    const container = document.getElementById('input-container');
    container.innerHTML = '';
    TOTAL_PLAYERS = playerCount;

    if (isNaN(playerCount) || playerCount < 2 || isNaN(roundCount) || roundCount < 1) {
        alert("참가자 수와 라운드 수를 올바르게 입력해주세요.");
        return;
    }

    let playerSetupHTML = '<h3>👤 참가자 이름 입력</h3>';
    for (let i = 1; i <= playerCount; i++) {
        playerSetupHTML += `
            <div class="player-input">
                <label>참가자 ${i} 이름:</label>
                <input type="text" id="player${i}Name" value="P${i}">
            </div>`;
    }
    container.innerHTML += playerSetupHTML + '<hr>';

    let roundInputHTML = '<h3>🏆 라운드별 결과 입력</h3>';
    for (let r = 1; r <= roundCount; r++) {
        roundInputHTML += `
            <div class="round-block">
                <h4>라운드 ${r}</h4>
                <div class="input-group">
                    <label>팀 구성:</label>
                    <select id="round${r}Config">
                        <option value="2-2">2 vs 2</option>
                        <option value="1-1">1 vs 1</option>
                        <option value="1-2">1 vs 2 (1명 팀 불리)</option>
                        <option value="2-1">2 vs 1 (2명 팀 불리)</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>팀 A (이름 쉼표 구분):</label>
                    <input type="text" id="round${r}TeamA" placeholder="예: P1,P2">
                </div>
                <div class="input-group">
                    <label>팀 B (이름 쉼표 구분):</label>
                    <input type="text" id="round${r}TeamB" placeholder="예: P3,P4">
                </div>
                <div class="input-group">
                    <label>승팀:</label>
                    <select id="round${r}Winner">
                        <option value="A">팀 A 승</option>
                        <option value="B">팀 B 승</option>
                    </select>
                </div>
            </div>`;
    }
    container.innerHTML += roundInputHTML;
}

// 최종 정산 계산
function calculateSettlement() {
    const totalCostPerRound = parseFloat(document.getElementById('totalCost').value) || 0;
    const playerCount = TOTAL_PLAYERS;
    const roundCount = parseInt(document.getElementById('roundCount').value);
    const resultsDiv = document.getElementById('final-settlement');
    resultsDiv.innerHTML = '';

    if (playerCount === 0 || roundCount === 0) {
        resultsDiv.innerHTML = '<p class="error">⚠️ 입력 필드 생성 버튼을 먼저 눌러주세요.</p>';
        return;
    }

    const totalGameCost = totalCostPerRound * roundCount;
    document.getElementById('totalGameCost').textContent = totalGameCost.toLocaleString();

    let playerCosts = {};
    for (let i = 1; i <= playerCount; i++) {
        const name = document.getElementById(`player${i}Name`).value.trim() || `P${i}`;
        playerCosts[name] = 0; // 0원부터 시작 (신발비 제외)
    }

    for (let r = 1; r <= roundCount; r++) {
        const config = document.getElementById(`round${r}Config`).value;
        const winner = document.getElementById(`round${r}Winner`).value;
        const teamA = document.getElementById(`round${r}TeamA`).value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const teamB = document.getElementById(`round${r}TeamB`).value.split(',').map(s => s.trim()).filter(s => s.length > 0);

        if (teamA.length === 0 || teamB.length === 0) continue;

        const losingTeam = (winner === 'A') ? teamB : teamA;
        const losingTeamSize = losingTeam.length;
        
        let lossShare = 1; 

        // 1:2 혹은 2:1 불리한 팀 75% 규칙
        if ((config === '1-2' && losingTeamSize === 1) || (config === '2-1' && losingTeamSize === 2)) {
            lossShare = 0.75; 
        }

        const roundLossAmount = totalCostPerRound * lossShare;
        const costPerLoser = roundLossAmount / losingTeamSize;

        losingTeam.forEach(name => {
            if (playerCosts.hasOwnProperty(name)) {
                playerCosts[name] += costPerLoser;
            }
        });
    }

    let resultHTML = '<ul>';
    Object.keys(playerCosts).forEach(name => {
        const amount = playerCosts[name];
        resultHTML += `
            <li>
                <strong>${name}</strong>: 
                <span class="cost-amount">${Math.round(amount).toLocaleString()}원</span> 부담
            </li>`;
    });
    resultHTML += '</ul>';
    
    resultsDiv.innerHTML = resultHTML;
}

document.addEventListener('DOMContentLoaded', generateInputFields);
