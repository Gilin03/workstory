# BR-A Profile Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 9번 서사와 실제 출석·리추얼 기록을 근거로, 지원용으로 읽히는 BR-A 자기소개 사이트와 제출 checklist를 완성한다.

**Architecture:** Vite React 정적 사이트가 사람이 승인한 `src/content/approved.json`과 generator가 만든 `src/generated/site-data.json`을 정적으로 읽는다. 입력 원자료는 `inputs/`에 두고 generator가 결석·확정 출석·리추얼 수치와 문단 후보를 결정적으로 만든다. UI는 변화 지도 hero, 3장면 서사 행, 능력 행, 기록판, 대표작, 문서 링크의 단일 페이지 구조로 유지한다.

**Tech Stack:** React, Vite, plain CSS, Node.js generator/test, JSON inputs, DOCX/PDF artifacts.

**Spec:** `docs/superpowers/specs/2026-09-17-profile-site-redesign-design.md`

## Global Constraints

- 사실은 `assignment09_narrative.md`, `inputs/ritual-history.json`, 사용자가 제공한 출석 화면 수치에 한정한다.
- 제출 현황 원자료가 없으면 수치를 생성하지 않고 미확인으로 표시한다.
- 다른 사람의 실명·연락처와 비밀값을 결과물에 넣지 않는다.
- 13번 앱은 실제 링크가 없으므로 placeholder만 둔다.
- Git commit/push, Vercel 배포, 실제 DB 변경은 하지 않는다.
- 새 패키지는 추가하지 않고 현재 React/Vite/npm 구성을 유지한다.

---

### Task 1: 요구사항 checklist와 원자료 연결

**Files:**
- Create: `checklist.md`
- Create: `inputs/attendance.json`
- Modify: `inputs/README.md`
- Read: `assignment09_narrative.md`, `START_PROMPT.md`, `AGENTS.md`

**Interfaces:**
- `inputs/attendance.json`은 generator가 출석 summary를 읽는 입력이다.
- `checklist.md`는 최종 제출 전에 사용자가 확인할 상태표다.

- [ ] **Step 1: 실제 근거를 상태표로 기록한다**

  BRA-C01~C21 각 행에 현재 상태, 파일 근거, 남은 조치를 적고 공개 URL·이메일·제출 현황처럼 사용자가 직접 확정해야 하는 항목을 별도 표시한다.

- [ ] **Step 2: 출석 화면의 확인 가능한 값만 입력한다**

  `trainingDays: 27`, `enrolledDays: 27`, `attendedDays: 26`, `absentDays: 0`, `pendingDays: 1`, `asOf: 2026-09-17`을 저장하고 9/17이 확정 전이라는 note를 붙인다. 출석률은 저장·표시하지 않는다.

- [ ] **Step 3: 원자료 설명을 갱신한다**

  `inputs/README.md`에 출석 summary가 화면 캡처에서 옮겨진 값이며, 새로운 원자료가 생기면 같은 필드 구조로 교체한다는 점을 적는다.

**Completion:** checklist 파일과 출석 입력이 존재하고, 출석 값을 임의로 100%로 바꾸지 않았음을 확인한다.

### Task 2: 승인 콘텐츠와 결정적 generator 갱신

**Files:**
- Modify: `src/content/approved.json`
- Modify: `scripts/generate.mjs`
- Modify: `scripts/generate.test.mjs`
- Regenerate: `src/generated/site-data.json`, `src/generated/metrics.json`, `src/generated/candidates.md`

**Interfaces:**
- `approved.json`은 UI가 직접 표시하는 사람이 검토한 사실이다.
- `attendanceMetrics()`는 출석 summary를 받아 결석·확정 출석 metric 배열을 반환한다.

- [ ] **Step 1: 9번 문서의 세 장면과 강점 매핑을 승인 콘텐츠에 반영한다**

  2022년 고비, 2022년 먼저 인사하고 질문한 변화, 2026년 8월 28일·9월 7일·9월 8일·9월 9일 기록을 사용한다. 소설식으로 추가된 ICT 장비 상태 묘사와 확인되지 않은 문장을 제거한다.

- [ ] **Step 2: summary 입력을 결정적으로 계산하는 테스트를 먼저 갱신한다**

  `test:generator`가 현재 입력을 두 임시 폴더에 생성하고 모든 파일을 byte-compare하며, ritual 3개와 attendance metric 3개가 포함되는지 확인한다.

- [ ] **Step 3: generator에 summary 처리와 개인정보 safeText를 구현한다**

  `attendance.json`에 summary가 있으면 해당 값을 사용하고, 없을 때만 records를 계산한다. 출석 metric은 결석·확정 출석으로 만들며 source/evidence 경로를 함께 기록한다. `generatedAt`은 입력 최신 날짜에서만 유도한다.

- [ ] **Step 4: generator를 실행해 정적 데이터를 갱신한다**

  Run: `npm run generate`

  Expected: metrics에는 ritual과 attendance가 들어가고, submissions.json이 없으면 missingSources에만 남는다.

**Completion:** 9번 근거가 승인 JSON에 있고, 같은 입력의 두 생성 결과가 byte-identical이다.

### Task 3: 정보 구조를 지원용 페이지로 교체

**Files:**
- Modify: `src/main.jsx`

**Interfaces:**
- `App`은 approved content와 generated metrics만 소비한다.
- 앵커는 `#story`, `#strengths`, `#proof`, `#works`, `#documents`를 사용한다.

- [ ] **Step 1: hero를 이름·한 줄·핵심 숫자·trace line 구조로 교체한다**
- [ ] **Step 2: story를 3개의 순차 장면 timeline으로 교체한다**
- [ ] **Step 3: 요구 능력 세 가지를 각 실제 장면과 함께 표시한다**
- [ ] **Step 4: generated metrics를 출처가 보이는 기록판으로 표시한다**
- [ ] **Step 5: 논문 다운로드, 앱 placeholder, DOCX 링크와 연락처 보류 상태를 표시한다**

**Completion:** 첫 화면만 읽어도 이름·직무 방향·변화의 흐름·결석 및 반복 기록·대표작 진입점이 보인다.

### Task 4: 새로운 시각 디자인과 반응형 검토

**Files:**
- Modify: `src/styles.css`
- Modify: `index.html`

**Interfaces:**
- CSS token은 ink/paper/blue/coral/grid 네임드 변수로만 관리한다.
- 320px 이상의 모바일과 넓은 화면에서 같은 정보 순서를 유지한다.

- [x] **Step 1: 기존 terracotta 원형 그래픽 스타일을 제거한다**
- [x] **Step 2: 공유 Figma의 차콜·오렌지 포트폴리오 무드, trace line, evidence rail, file-card hierarchy를 구현한다**
- [ ] **Step 3: focus-visible, contrast, reduced motion, mobile layout을 구현한다**
- [ ] **Step 4: 외부 글꼴 장애 시 시스템 fallback에서도 줄바꿈이 무너지지 않는지 확인한다**

**Completion:** hero와 본문이 하나의 지원용 편집물처럼 보이고, 반복 카드·과한 장식·긴 가로 문장이 없다.

### Task 5: 문서·ZIP·검증 문서 동기화

**Files:**
- Modify: `scripts/create_application_doc.py`
- Modify: `docs/verification.md`
- Modify: `docs/content-review.md`
- Modify: `docs/ai-human-judgment.md`
- Modify: `BR-A-README.md`
- Regenerate: `deliverables/김태빈_지원서_묶음.docx`
- Regenerate: `deliverables/김태빈_BR-A_갱신장치.zip`

- [ ] **Step 1: 9번 자기소개서와 사이트 본편이 같은 사실 순서를 갖도록 문서 생성기를 갱신한다**
- [ ] **Step 2: checklist·출석 수치·제출 현황 보류를 확인 방법에 적는다**
- [ ] **Step 3: DOCX를 생성하고 privacy scrub을 실행한다**
- [ ] **Step 4: 실행 소스·README·마지막 결과가 들어간 ZIP을 새로 만든다**

**Completion:** 문서와 ZIP이 현재 승인 콘텐츠·입력·생성 결과와 일치한다.

### Task 6: 자동·브라우저 검증

**Files:**
- Test: `scripts/generate.test.mjs`
- Verify: `checklist.md`, local browser, `dist/`

- [ ] **Step 1: 생성기 동일성 테스트를 실행한다**

  Run: `npm run test:generator`

  Expected: 1 test pass, 0 fail.

- [ ] **Step 2: 개인정보 검사를 실행한다**

  Run: `npm run check:privacy`

  Expected: `privacy check passed`.

- [ ] **Step 3: production build를 실행한다**

  Run: `npm run build`

  Expected: Vite exits 0 and writes `dist/`.

- [ ] **Step 4: 브라우저에서 핵심 경로를 확인한다**

  Check: first screen, story anchors, three abilities, attendance/ritual source labels, paper PDF, DOCX, 13 app placeholder, console errors.

- [ ] **Step 5: checklist를 최종 상태로 갱신한다**

  Public HTTPS URL, real email, and missing submission source remain user-action items unless the user supplies them.

**Completion:** 명령 출력과 브라우저 확인 결과가 checklist와 일치한다.
