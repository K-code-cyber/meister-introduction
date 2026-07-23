
document.getElementById('runBtn').addEventListener('click', runSimulation);

let co2ChartInstance = null;
let energyChartInstance = null;

function runSimulation() {
    const students = parseInt(document.getElementById('students').value);
    const hours = parseInt(document.getElementById('hours').value);
    const totalMinutes = hours * 60;

    // 물리 및 환경 시스템 초기 변수 설정
    let co2 = 400;
    let filterCapacity = 0;
    let regenerationTimer = 0;
    
    let energyCaseA = 0;
    let energyCaseB = 0;

    let timeLabels = [];
    let co2Data = [];
    let energyDataA = [];
    let energyDataB = [];

    // 학생들이 인원당 내뿜는 분당 CO2 상승량 가중치
    const co2GenPerStudent = 1.2; 
    const baseCo2Gen = students * co2GenPerStudent; 

    // 타임라인 반복문 작동 (8시간)
    for (let t = 0; t <= totalMinutes; t++) {
        timeLabels.push(`${t}분`);
        
        if (t > 0) co2 += baseCo2Gen; // 1. CO2 생성 누적

        // [Case A] 기존 방식: 계속 문 열어둬서 새어 나가는 에어컨 부하 비용 상시 누적
        energyCaseA += 0.4 * (students / 30);

        // [Case B] 우리 스마트 필터 제어 방식
        if (regenerationTimer > 0) {
            // 필터 100도로 탈착 구이 진행 중인 15분
            regenerationTimer--;
            co2 -= (baseCo2Gen * 0.8); // 백업 카드로 임시 환기구 열어서 CO2 스파이크 억제
            
            if (regenerationTimer === 0) filterCapacity = 0; // 청소 끝 리셋
        } else if (co2 >= 1000) {
            // 1000ppm 감지 시 밀폐 후 필터 가동
            co2 -= (baseCo2Gen + 10);
            filterCapacity += (students * 0.08); // 탄소 누적
            
            if (filterCapacity >= 100) {
                filterCapacity = 100;
                regenerationTimer = 15; // 15분 타이머 셋업
                energyCaseB += 45;      // 100도 줄 가열 순간 전기세 쾅 부과
            }
        } else {
            // 1000ppm 미만 평시: 필터 대기, 창문 닫힘 -> 에어컨 유지 초저전력 버티기
            energyCaseB += 0.05; 
        }

        if (co2 < 400) co2 = 400; // 하한선 보정

        // 데이터 어레이에 수치 입력
        co2Data.push(Math.round(co2));
        energyDataA.push(parseFloat(energyCaseA.toFixed(2)));
        energyDataB.push(parseFloat(energyCaseB.toFixed(2)));
    }

    // 결과값 UI 업데이트
    document.getElementById('co2Display').innerHTML = `<span class="value">${Math.round(co2)}</span> ppm`;
    document.getElementById('filterDisplay').innerHTML = `<span class="value">${Math.round(filterCapacity)}</span> %`;
    
    const statusEl = document.getElementById('statusDisplay');
    if (regenerationTimer > 0) {
        statusEl.innerHTML = '<span class="value badge orange">필터 재생 중 (줄 가열)</span>';
    } else if (co2 >= 980) {
        statusEl.innerHTML = '<span class="value badge green">필터 흡착 가동 중</span>';
    } else {
        statusEl.innerHTML = '<span class="value badge grey">안정 대기 상태</span>';
    }

    // 종합 성적표 계산 출력
    document.getElementById('reportCard').classList.remove('hidden');
    document.getElementById('energyA').innerText = `${energyCaseA.toFixed(1)} kWh`;
    document.getElementById('energyB').innerText = `${energyCaseB.toFixed(1)} kWh`;
    
    const savings = ((energyCaseA - energyCaseB) / energyCaseA) * 100;
    document.getElementById('savingsRate').innerText = `${savings.toFixed(1)} %`;

    // 그래프 다시 그리기
    renderCharts(timeLabels, co2Data, energyDataA, energyDataB);
}

function renderCharts(labels, co2Data, energyA, energyB) {
    if (co2ChartInstance) co2ChartInstance.destroy();
    if (energyChartInstance) energyChartInstance.destroy();

    const ctxCo2 = document.getElementById('co2Chart').getContext('2d');
    co2ChartInstance = new Chart(ctxCo2, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '실내 CO₂ 농도 (ppm)',
                data: co2Data,
                borderColor: '#2a5298',
                backgroundColor: 'rgba(42, 82, 152, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true
            }]
        },
        options: { responsive: true, scales: { y: { min: 300, max: 1400 } } }
    });

    const ctxEnergy = document.getElementById('energyChart').getContext('2d');
    energyChartInstance = new Chart(ctxEnergy, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: '기존 환기 방식 (상시 개방)', data: energyA, borderColor: '#e74c3c', borderWidth: 2, pointRadius: 0, fill: false },
                { label: '우리 시스템 (필터 제어)', data: energyB, borderColor: '#2ecc71', borderWidth: 2, pointRadius: 0, fill: false }
            ]
        },
        options: { responsive: true }
    });
}
