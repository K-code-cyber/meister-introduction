// calculator.js

// 전역 변수 설정
let TOTAL_PLAYERS = 0;
const SHOE_FEE_PER_PERSON = 1000;

// 입력 필드 동적 생성 함수
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

    // 참가자 이름 입력 필드 생성
    let playerSetupHTML = '<h3>👤 참가자 이름 입력</h3>';
    for (let i = 1; i <= playerCount; i++) {
        playerSetupHTML += `
            <div class="player-input">
                <label>참가자 ${i} 이름:</label>
                <input type="text" id="player${i}Name" value="P${i}">
            </div>`;
    }
    container.innerHTML += playerSetupHTML + '<hr>';

    // 라운드별 승패 및 팀 구성 입력 필드 생성
    let roundInputHTML = '<h3>🏆 라운드별 결과 입력</h3>';
    for (let r = 1; r <= roundCount; r++) {
        roundInputHTML += `
            <div class="round-block">
                <h4>라운드 ${r}</h4>
                <div class="input-group">
                    <label for="round${r}Config">팀 구성:</label>
                    <select id="round${r}Config">
                        <option value="2-2">2 vs 2</option>
                        <option value="1-1">1 vs 1</option>
                        <option value="1-2">1 vs 2 (1명 팀 불리)</option>
                        <option value="2-1">2 vs 1 (1명 팀 유리)</option>
                        <option value="3-3">3 vs 3</option>
                    </select>
                </div>

                <div class="input-group">
                    <label for="round${r}TeamA">팀 A (이름 쉼표 구분):</label>
                    <input type="text" id="round${r}TeamA" placeholder="예: P1,P2">
                </div>
                <div class="input-group">
                    <label for="round${r}TeamB">팀 B (이름 쉼표 구분):</label>
                    <input type="text" id="round${r}TeamB" placeholder="예: P3,P4">
                </div>

                <div class="input-group">
                    <label for="round${r}Winner">승팀:</label>
                    <select id="round${r}Winner">
                        <option value="A">팀 A 승</option>
                        <option value="B">팀 B 승</option>
                    </select>
                </div>
            </div>`;
    }

    container.innerHTML += roundInputHTML;
}

// 최종 정산 계산 함수
function calculateSettlement() {
    const totalCost = parseFloat(document.getElementById('totalCost').value) || 0;
    const playerCount = TOTAL_PLAYERS;
    const roundCount = parseInt(document.getElementById('roundCount').value);
    const resultsDiv = document.getElementById('final-settlement');
    resultsDiv.innerHTML = '';

    if (playerCount === 0 || roundCount === 0) {
        resultsDiv.innerHTML = '<p class="error">⚠️ **입력 필드 생성** 버튼을 눌러 정보를 입력해주세요.</p>';
        return;
    }

    // 신발 대여료 계산
    const totalShoeFee = playerCount * SHOE_FEE_PER_PERSON;
    const totalGameCost = totalCost * roundCount;

    // 결과 요약 업데이트
    document.getElementById('shoeFeeTotal').textContent = totalShoeFee.toLocaleString();
    document.getElementById('totalGameCost').textContent = totalGameCost.toLocaleString();

    let playerCosts = {};
    
    // 1단계: 참가자 이름 초기화 및 신발 대여료 부과
    for (let i = 1; i <= playerCount; i++) {
        const name = document.getElementById(`player${i}Name`).value.trim() || `P${i}`;
        // 신발 대여료 1000원 선 부과
        playerCosts[name] = SHOE_FEE_PER_PERSON; 
    }

    // 2단계: 라운드별 내기 비용 계산 및 부과
    const costPerRound = totalCost;
    
    for (let r = 1; r <= roundCount; r++) {
        const config = document.getElementById(`round${r}Config`).value;
        const winner = document.getElementById(`round${r}Winner`).value;
        
        // 이름 파싱 및 공백 제거
        const teamA = document.getElementById(`round${r}TeamA`).value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const teamB = document.getElementById(`round${r}TeamB`).value.split(',').map(s => s.trim()).filter(s => s.length > 0);

        if (teamA.length === 0 || teamB.length === 0) continue; // 팀 정보 누락 시 해당 라운드 무시

        const losingTeam = (winner === 'A') ? teamB : teamA;
        const losingTeamSize = losingTeam.length;
        
        let lossShare = 1; // 기본 부담률 100%

        // 1:2 혹은 2:1 불리한 팀 규칙 적용 (진 팀이 불리한 팀인 경우에만 75% 적용)
        if (config === '1-2' && losingTeamSize === 1) { // 1 vs 2에서 1명 팀(불리)이 졌을 때
            lossShare = 0.75; 
        } else if (config === '2-1' && losingTeamSize === 2) { // 2 vs 1에서 2명 팀(불리)이 졌을 때
            lossShare = 0.75; 
        }

        // 라운드별 진 팀 총 부담 금액
        const roundLossAmount = costPerRound * lossShare;
        // 1인당 부담 금액
        const costPerLoser = roundLossAmount / losingTeamSize;

        // 진 팀 멤버에게 비용 부과
        losingTeam.forEach(name => {
            if (playerCosts.hasOwnProperty(name)) {
                playerCosts[name] += costPerLoser;
            }
        });
    }

    // 3단계: 최종 결과 출력
    let totalSettlementHTML = '<ul>';
    let totalCollectedGameCost = 0;
    let validPlayerCount = 0;

    Object.keys(playerCosts).forEach(name => {
        const total = playerCosts[name];
        const gameCost = total - SHOE_FEE_PER_PERSON;
        
        // 유효한 참가자만 계산에 포함
        if (gameCost >= 0) {
            totalSettlementHTML += `
                <li>
                    <strong>${name}</strong>: 
                    <span class="cost-amount">${Math.round(total).toLocaleString()}원</span> 부담 
                    <span class="detail">(신발 1,000원 + 내기 ${Math.round(gameCost).toLocaleString()}원)</span>
                </li>
            `;
            totalCollectedGameCost += gameCost;
            validPlayerCount++;
        }
    });
    totalSettlementHTML += '</ul>';
    
    // 검증 메시지
    if (Math.abs(totalCollectedGameCost - totalGameCost) > 1 && validPlayerCount > 0) {
        totalSettlementHTML += `<p class="alert-message error">⚠️ **경
