import random
import os
import pandas as pd
import numpy as np

def create_sample_excel():
    """
    사용자가 입력할 샘플 엑셀 파일을 생성하는 함수
    """
    sample_data = {
        '이름': [f'학생{i}' for i in range(1, 26)],
        '시력안좋음': [1 if i in [3, 7, 12] else 0 for i in range(1, 26)],  # 1이면 무조건 앞줄(1~2행)
        '원하는짝': ['학생4' if i==3 else ('학생3' if i==4 else None) for i in range(1, 26)] # 서로 적은 짝 이름
    }
    df = pd.DataFrame(sample_data)
    df.to_excel('student_list.xlsx', index=False)
    print("📢 'student_list.xlsx' 샘플 파일이 생성되었습니다. 이 파일을 교실 상황에 맞게 수정하여 사용하세요.")

def load_students(file_path):
    df = pd.read_excel(file_path)
    # NaN(빈칸) 값을 처리하기 위해 중복 및 결측치 보정
    df['원하는짝'] = df['원하는짝'].fillna('')
    return df.to_dict('records')

def arrange_seats(students, rows, cols):
    """
    행렬과 부등식 조건을 만족하는 좌석을 배치하는 핵심 알고리즘
    """
    total_seats = rows * cols
    if len(students) > total_seats:
        print(f"❌ 오류: 학생 수({len(students)})가 총 좌석 수({total_seats})보다 많습니다.")
        return None

    # 빈 좌석 채우기 (인원수가 좌석보다 적을 때를 대비)
    while len(students) < total_seats:
        students.append({'이름': '빈자리', '시력안좋음': 0, '원하는짝': ''})

    max_attempts = 50000
    for attempt in range(max_attempts):
        shuffled = students.copy()
        random.shuffle(shuffled)
        
        # 2차원 좌석 행렬(Matrix)로 변환
        seat_matrix = np.array(shuffled).reshape(rows, cols)
        
        is_valid = True
        
        # [수학적 모델 검증 1] 부등식 조건 체크: 시력 저하 학생 위치 (i <= 1, 0행과 1행만 허용)
        for i in range(rows):
            for j in range(cols):
                student = seat_matrix[i, j]
                if student['시력안좋음'] == 1 and i > 1:  # 3행 이상에 배치된 경우 탈락
                    is_valid = False
                    break
            if not is_valid:
                break
                
        if not is_valid:
            continue

        # [수학적 모델 검증 2] 짝 배치 조건 체크: 가로로 이웃해 있는지 검증
        for i in range(rows):
            for j in range(cols):
                student = seat_matrix[i, j]
                target_pair = student['원하는짝']
                
                if target_pair and target_pair != '빈자리':
                    has_pair = False
                    if j > 0 and seat_matrix[i, j-1]['이름'] == target_pair:
                        has_pair = True
                    if j < cols - 1 and seat_matrix[i, j+1]['이름'] == target_pair:
                        has_pair = True
                        
                    if not has_pair:
                        is_valid = False
                        break
            if not is_valid:
                break

        # 모든 행렬 및 부등식 제약 조건을 만족하면 배치 확정
        if is_valid:
            print(f"✅ {attempt+1}번째 시도만에 최적의 배치를 찾았습니다!")
            return seat_matrix

    print("⚠️ 조건을 만족하는 자리를 찾지 못했습니다. 제약 조건을 완화해 주세요.")
    return None

def print_seats(seat_matrix):
    """
    최종 배치 행렬을 보기 좋게 출력하는 함수
    """
    if seat_matrix is None:
        return
    
    print("\n========= 🪑 교탁 (앞쪽) =========")
    for row in seat_matrix:
        row_str = " | ".join([f"{st['이름']}(앞)" if st['시력안좋음']==1 else f"{st['이름']}" for st in row])
        print(f"[ {row_str} ]")
    print("==================================\n")

# 실행 제어부
if __name__ == "__main__":
    # 강의실 설정 (행, 열) -> 인원 수와 교실 크기를 조절하는 칸
    ROWS = 5
    COLS = 5
    
    # 엑셀 파일이 없으면 자동으로 예시 파일을 만들어 줍니다.
    if not os.path.exists('student_list.xlsx'):
        create_sample_excel()
        
    print("🔄 좌석 배치 연산을 시작합니다...")
    student_data = load_students('student_list.xlsx')
    final_layout = arrange_seats(student_data, ROWS, COLS)
    print_seats(final_layout)
