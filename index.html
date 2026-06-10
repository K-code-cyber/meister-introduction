import random

def create_seating_chart():
    print("=== ✨ 학교 랜덤 자리배치 프로그램 ✨ ===")
    
    # 1. 학생 수 및 기본 정보 입력
    while True:
        try:
            total_students = int(input("▶️ 학급의 총 인원수를 입력하세요: "))
            if total_students > 0:
                break
            print("❌ 인원수는 1명 이상이어야 합니다.")
        except ValueError:
            print("❌ 올바른 숫자를 입력해주세요.")

    # 2. 배정 방식 선택 (개인 vs 짝)
    print("\n[ 배정 방식 선택 ]")
    print("1. 개인석 (1인용 책상 배열)")
    print("2. 짝꿍석 (2인용 책상 배열)")
    
    while True:
        choice = input("▶️ 원하는 방식의 번호를 입력하세요 (1 또는 2): ").strip()
        if choice in ['1', '2']:
            break
        print("❌ 1 또는 2를 입력해주세요.")

    # 1부터 총 인원수까지 번호 리스트 생성 후 랜덤 셔플
    students = list(range(1, total_students + 1))
    random.shuffle(students)

    print("\n" + "="*30)
    print("🎉 자리 배치가 완료되었습니다! 🎉")
    print("="*30 + "\n")

    # 3. 자리 배치 출력
    if choice == '1':
        # 개인석 출력 (한 줄에 5명씩 예시)
        print("[ 교탁 (앞) ]")
        for i in range(0, len(students), 5):
            row = students[i:i+5]
            # 보기 좋게 포맷팅 (숫자 자릿수 맞추기)
            row_str = "  ".join(f"[{num:2d}번]" for num in row)
            print(row_str)
            
    else:
        # 짝꿍석 출력
        print("[ 교탁 (앞) ]")
        for i in range(0, len(students), 2):
            # 두 명씩 묶어서 출력
            pair = students[i:i+2]
            
            if len(pair) == 2:
                print(f"[{pair[0]:2d}번] - [{pair[1]:2d}번]", end="")
            else:
                # 홀수 명일 경우 혼자 앉는 자리 처리
                print(f"[{pair[0]:2d}번] - [ 혼 자 ]", end="")
            
            # 통로(줄바꿈) 공간을 위해 한 쌍 출력 후 적절히 띄우기 (한 줄에 2쌍씩 배치 예시)
            if (i // 2) % 2 == 1:
                print()  # 두 쌍(4명) 배치 후 줄바꿈
            else:
                print("    |    ", end="") # 분단 사이 통로 표시
        print() # 최종 줄바꿈

    print("\n" + "="*30)

if __name__ == "__main__":
    create_seating_chart()
