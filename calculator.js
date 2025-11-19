// 전역 변수 설정 (참가자 이름을 저장)
let playerNames = [];

function generateInputFields() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    const roundCount = parseInt(document.getElementById('roundCount').value);
    const namesContainer = document.getElementById('player-names-container');
    const roundContainer = document.getElementById('round-container');

    if (playerCount < 2 || roundCount < 1) {
        alert("참가자 수는 2명 이상, 라운드 수는 1라운드 이상이어야 합니다.");
        return;
    }

    namesContainer.innerHTML = '<h3>참가자 이름 입력</h3>';
    playerNames = [];

    // 참가자 이름 입력 필드 생성
    for (let i = 1; i <= playerCount; i++) {
        const inputDiv = document.createElement('div');
        inputDiv.className = 'input-group';
        inputDiv.innerHTML = `<label for="player-name-${i}">플레이어 ${i} 이름:</label><input type="text" id="player-name-${i}" value="플레이어 ${i}">`;
        namesContainer.appendChild(inputDiv);
        playerNames.push(`플레이어 ${i}`); // 초기 이름 설정
    }

    // 라운드 결과 입력 필드 생성
    roundContainer.innerHTML = '<h3>라운드 승패 기록</h3>';
    
    // Team Option Generator (승패 선택 드롭다운에 사용)
    const getTeamOptions = () => {
        let options = '<option value="">-- 승리 팀 선택 --</option>';
        options += '<option value="Team A">Team A 승리</option>';
        options += '<option value="Team B">Team B 승리</option>';
        return options;
    };
    
    // 라운드별 승패 입력 필드
    for (let r = 1; r <= roundCount; r++) {
        const roundRow = document.createElement('div');
        roundRow.className = 'round-result-row';
        
        // 1. 승리팀 선택 드롭다운
        roundRow.innerHTML = `<label for="round-winner-${r}">라운드 ${r} 승리 팀:</label><select id="round-winner-${r}">${getTeamOptions()}</select>`;

        // 2. 팀 구성 드롭다운
        roundRow.innerHTML += `<div class="team-setup">
            <label>Team A (승리팀 선택 시 면제):</label>
            <select id="team-a-${r}" multiple size="${playerCount > 5 ? 5 : playerCount}" onchange="updateTeamB(${r})"></select>
            <label>Team B (패배팀 선택 시 지불):</label>
            <select id="team-b-${r}" multiple size="${playerCount > 5 ? 5 : playerCount}" disabled></select>
        </div>`;

        roundContainer.appendChild(roundRow);
    }
    
    // 이름 입력 후, 팀 구성 드롭다운을 플레이어 이름으로 업데이트
    updateAllTeamSelectors();
}

function updateAllTeamSelectors() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    const roundCount = parseInt(document.getElementById('roundCount').value);
    
    // 현재 입력된 참가자 이름 가져오기
    playerNames = [];
    for (let i = 1; i <= playerCount; i++) {
        const name = document.getElementById(`player-name-${i}`)?.value || `플레이어 ${i}`;
        playerNames.push(name);
    }

    for (let r = 1; r <= roundCount; r++) {
        const selectorA = document.getElementById(`team-a-${r}`);
        const selectorB = document.getElementById(`team-b-${r}`);
        
        // 옵션 목록 재생성
        let optionsHTML = playerNames.map((name, index) => 
            `<option value="${name}">${name}</option>`
        ).join('');
        
        selectorA.innerHTML = optionsHTML;
        // Team B는 Team A 선택에 따라 자동으로 업데이트되므로, 여기서 직접 모든 옵션을 넣음
        selectorB.innerHTML = optionsHTML;
        
        // Team B를 비활성화 상태로 유지
        selectorB.disabled = true;
    }
}

// Team A 선택 시, Team B 자동 업데이트 (남은 플레이어로)
function updateTeamB(roundNum) {
    const selectorA = document.getElementById(`team-a-${roundNum}`);
    const selectorB = document.getElementById(`team-b-${roundNum}`);
    
    const selectedA = Array.from(selectorA.selectedOptions).map(option => option.value);
    
    // Team B는 Team A에 선택되지 않은 나머지 플레이어들로 구성
    const teamBPlayers = playerNames.filter(name => !selectedA.includes(name));
    
    selectorB.innerHTML = teamBPlayers.map(name => 
        `<option value="${name}" selected>${name}</option>`
    ).join('');
    
    // 경고 메시지: 모든 플레이어가 두 팀 중 하나에 포함되어야 함
    if (selectedA.length + teamBPlayers.length !== playerNames.length) {
        alert("경고: 모든 참가자가 두 팀 중 하나에 반드시 배정되어야 합니다.");
    }
}


function calculateSettlement() {
    // 최종 정산 결과를 저장할 객체: { playerName: { shoeFee: 1000, gameCost: 0, totalPayment: 1000 } }
    let settlement = {};
    playerNames.forEach(name => {
        settlement[name] = { shoeFee: 1000, gameCost: 0, totalPayment: 1000 };
    });

    const totalCostPerRound = parseFloat(document.getElementById('totalCost').value);
    const roundCount = parseInt(document.getElementById('roundCount').value);
    
    let totalBetCost = 0; // 실제로 내기 때문에 발생하는 총 비용

    // 1. 라운드별 정산
    for (let r = 1; r <= roundCount; r++) {
        const winner = document.getElementById(`round-winner-${r}`)?.value;
        const selectorA = document.getElementById(`team-a-${r}`);
        const selectorB = document.getElementById(`team-b-${r}`);

        if (!winner) {
            alert(`${r}라운드의 승리 팀을 선택해 주세요.`);
            return;
        }

        // 라운드 팀 구성원 확인
        const teamA = Array.from(selectorA.selectedOptions).map(option => option.value);
        const teamB = Array.from(selectorB.selectedOptions).map(option => option.value);
        
        // 승리 팀과 패배 팀 지정
        const winningTeam = (winner === 'Team A') ? teamA : teamB;
        const losingTeam = (winner === 'Team A') ? teamB : teamA;
        
        // 2. 핸디캡 및 비용 계산
        let roundCost = totalCostPerRound;
        let paymentMultiplier = 1.0; // 지불 비율 (기본 100%)

        // 1 vs 2 핸디캡 규칙 적용
        if (winningTeam.length === 2 && losingTeam.length === 1) {
            // 2명 팀 승리, 1명 팀 패배 -> 패배팀은 75%만 지불
            paymentMultiplier = 0.75; 
        }

        const losingPayment = roundCost * paymentMultiplier; // 패배 팀이 실제로 내야 할 총 금액
        totalBetCost += losingPayment; // 총 내기 비용에 합산
        
        // 3. 패배 팀 내에서 비용 분담
        const sharePerLoser = losingPayment / losingTeam.length;

        losingTeam.forEach(player => {
            if (settlement[player]) {
                settlement[player].gameCost += sharePerLoser;
                settlement[player].totalPayment += sharePerLoser;
            }
        });
        // 이긴 팀 (winningTeam)은 이 라운드 비용(gameCost) 면제 (추가 금액 없음)
    }

    // 4. 최종 결과 출력
    document.getElementById('totalGameCost').textContent = totalBetCost.toLocaleString('ko-KR');
    document.getElementById('totalBetCost').textContent = (totalBetCost + settlement[playerNames[0]].shoeFee * playerNames.length).toLocaleString('ko-KR');
    document.getElementById('shoeFeeTotal').textContent = (settlement[playerNames[0]].shoeFee * playerNames.length).toLocaleString('ko-KR');
    
    let settlementHTML = '<h3>💸 최종 참가자별 지불 금액</h3>';
    
    // 정렬 (많이 낸 순서)
    const sortedPlayers = Object.keys(settlement).map(key => settlement[key]);

    sortedPlayers.sort((a, b) => b.totalPayment - a.totalPayment);

    sortedPlayers.forEach(player => {
        const finalAmount = Math.round(player.totalPayment);
        const statusClass = (player.gameCost > 0) ? 'owes' : 'receives';
        
        settlementHTML += `
            <div class="${statusClass}">
                <span>${player.name} (패배분담금: ${Math.round(player.gameCost).toLocaleString()}원)</span>
                <span>총 ${finalAmount.toLocaleString('ko-KR')}원 지불</span>
            </div>
        `;
    });

    document.getElementById('final-settlement').innerHTML = settlementHTML;
}

// 초기 필드 생성 및 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    generateInputFields();
    // 이름 입력 필드에 입력이 있을 때마다 팀 셀렉터를 업데이트하도록 이벤트 리스너 추가
    document.getElementById('playerCount').addEventListener('change', generateInputFields);

    const namesContainer = document.getElementById('player-names-container');
    // 이름 입력이 바뀔 때마다 팀 구성 드롭다운 업데이트
    namesContainer.addEventListener('input', updateAllTeamSelectors);
});
