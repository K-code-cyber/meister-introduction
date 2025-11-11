
import sympy
from flask import Flask, request, jsonify

# --- Flask 앱 설정 ---
app = Flask(__name__)

# --- 수학 문제 풀이 함수 ---
def solve_math_problem(expression_str):
    """
    주어진 문자열 수학 표현식을 계산하고 결과를 문자열로 반환합니다.
    """
    try:
        # SymPy를 사용하여 문자열을 계산 가능한 수학 표현식으로 변환
        # evalf()는 수치적인 근사값을 계산합니다.
        result = sympy.sympify(expression_str).evalf()

        # 결과를 깔끔한 문자열로 변환
        return str(result)

    except Exception as e:
        # 계산 불가능하거나 잘못된 표현식인 경우 에러 메시지 반환
        return f"계산 오류: 올바른 수학 표현식이 아닙니다. (에러: {e})"

# --- 웹사이트 엔드포인트 설정 (AI가 응답하는 주소) ---
@app.route('/solve', methods=['POST'])
def solve():
    # 웹사이트(프론트엔드)에서 JSON 형태로 데이터를 받음
    data = request.get_json()
    problem = data.get('problem', '')

    if not problem:
        return jsonify({"result": "문제를 입력해 주세요."}), 400

    # 문제 풀이 함수 실행
    answer = solve_math_problem(problem)

    # 결과를 JSON 형태로 반환
    return jsonify({
        "question": problem,
        "answer": answer
    })

# --- 앱 실행 ---
# 웹 호스팅 플랫폼에서 앱을 실행할 때는 이 부분을 사용하지 않습니다.
# 보통 Gunicorn과 같은 WSGI 서버를 사용하여 앱을 실행합니다.
# 로컬 테스트를 위해 필요하다면 아래 주석을 해제하세요.
# if __name__ == '__main__':
#     app.run(debug=True, port=5000)
