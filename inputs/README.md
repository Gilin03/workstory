# 갱신 장치 입력 파일

실제 원자료는 다음 이름으로 이 폴더에 둡니다.

- `ritual-history.json`: 현재 제공된 리추얼 기록
- `attendance.json`: 출석 화면에서 확인한 summary 또는 `attendance.example.json`과 같은 records 구조의 출석 기록
- `submissions.json`: `submissions.example.json`과 같은 구조의 과제 제출 현황

예시 파일은 계산에 자동 포함되지 않습니다. 현재 `submissions.json`에는 과제 12 진행 중이라는 사용자 확인에 따라 1~11번 제출 완료를 기록했습니다. `attendance.json`과 `submissions.json`을 넣은 뒤 `npm run generate`를 실행하면 `src/generated/site-data.json`과 `src/generated/candidates.md`가 다시 만들어집니다.

현재 `attendance.json`은 2026-09-17 화면에서 확인한 값이다. 훈련일 27일, 재적일 27일, 확정 출석 26일, 결석 0일, 오늘 확정 전 1일을 담고 있다. 생성기는 수치와 `asOf` 기준일을 함께 보존하고, 사이트도 기준일을 표시한다. 출석률은 과제 필수 항목이 아니므로 입력·생성 결과·사이트에 포함하지 않는다. 새로운 출석 원자료가 생기면 이 파일을 교체하고 `npm run generate`를 실행한다.
