# 두 번 실행한 결과 비교

검증 명령:

```powershell
npm run test:generator
```

이 테스트는 같은 `inputs/`를 서로 다른 두 임시 폴더에 처리하고 `site-data.json`, `metrics.json`, `candidates.md`의 파일명·내용을 비교합니다.

최종 실행 결과: `1 passed, 0 failed`

생성기는 외부 AI API와 시스템 현재 시각을 사용하지 않고, 기준일도 입력 기록의 최신 날짜에서 계산합니다. 따라서 같은 입력이면 실행 위치와 실행 날짜가 달라도 같은 결과가 나옵니다.
