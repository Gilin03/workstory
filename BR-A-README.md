# BR-A 제출물 안내

이 폴더는 김태빈의 지원용 자기소개 사이트와 마지막 과제 A 제출물을 담고 있습니다. 사이트는 `npm run dev`로 열고, 새 기록을 반영할 때는 `npm run generate` → `candidates.md` 검토·승인 → `npm run build` 순서로 실행합니다.

## 확인 위치

- 이야기: 사이트의 `나의 이야기` 섹션, 승인 원문은 `src/content/approved.json`
- 숫자 근거: 사이트의 `근거` 섹션, 생성 결과는 `src/generated/metrics.json`
- 대표작: `public/assets/login-defense-study-paper.pdf`, 13번 앱은 준비 자리
- 지원 문서: `deliverables/김태빈_지원서_묶음.docx`
- 갱신 장치: `scripts/generate.mjs`, `scripts/content-check.mjs`, `scripts/privacy-check.mjs`

## 검증

```powershell
npm run generate
npm run test:generator
npm run check:content
npm run check:privacy
npm run build
```

생성기는 외부 AI나 현재 시각을 사용하지 않으므로 같은 입력에 같은 결과를 냅니다. 문단 후보는 자동으로 사이트에 게시하지 않고, 사람이 승인한 `approved.json`만 반영합니다. 제출 전 `checklist.md`에서 공개 이메일과 HTTPS URL을 직접 확정합니다.
