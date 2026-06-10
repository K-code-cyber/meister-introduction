import random
import numpy as np

# [데이터 설정] 여기에 학생 이름과 조건을 직접 수정해서 쓰세요!
# 이름: 학생 이름
# 시력안좋음: 1(앞줄 배치 필요), 0(상관없음)
# 원하는짝: 원하는 학생 이름 (없으면 '')
students = [
    {'이름': '학생1', '시력안좋음': 0, '원하는짝': ''},
    {'이름': '학생2', '시력안좋음': 0, '원하는짝': ''},
    {'이름': '학생3', '시력안좋음': 1, '원하는짝': '학생4'},
    {'이름': '학생4', '시력안좋음': 0, '원하는짝': '학생3'},
    {'이름': '학생5', '시력안좋음': 0, '원하는짝': ''},
    {'이름': '학생6', '시력안좋음': 0, '원하는짝': ''},
    {'이름': '학생7', '시력안좋음': 1, '원하는짝': ''},
    {'이름': '학생8', '시력안좋음': 0, '원하는짝': ''}
]

def arrange_seats(students, rows, cols):
    # 빈자리 채우기
    while len(students) < rows * cols:
        students.append({'이름': '빈자리', '시력안좋음': 0, '원하는짝': ''})

    for attempt in range(50000):
        random.shuffle(students)
        matrix = np.array(students).reshape(rows, cols)
        
        is_valid = True
        
        # 1. 시력 제약 조건 (0, 1행만 허용)
        for i in range(rows):
            for j in range(cols):
                if matrix[i, j]['시력안좋음'] == 1 and i > 1:
                    is_valid = False; break
            if not is_valid: break
        if not is_valid: continue

        # 2. 짝 배치 조건 (가로 이웃)
        for i in range(rows):
            for j in range(cols):
                s = matrix[i, j]
                if s['원하는짝']:
                    has_pair = False
                    if j > 0 and matrix[i, j-1]['이름'] == s['원하는짝']: has_pair = True
                    if j < cols - 1 and matrix[i, j+1]['이름'] == s['원하는짝']: has_pair = True
                    if not has_pair: is_valid = False; break
            if not is_valid: break

        if is_valid: return matrix
    return None

# 설정 및 실행
ROWS, COLS = 4, 2  # 인원수에 맞춰 행x열을 조정하세요
result = arrange_seats(students, ROWS, COLS)

print("\n========= 🪑 교탁 (앞쪽) =========")
if result is not None:
    for row in result:
        print(" | ".join([s['이름'] for s in row]))
else:
    print("조건을 만족하는 배치를 찾지 못했습니다.")
print("==================================\n")
