# BR-A Story-First Profile Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 9번 서사의 실제 사실과 13주 기록을 바탕으로, 숫자가 아니라 자기소개 본편이 중심으로 읽히는 지원용 BR-A 사이트와 제출물을 완성한다.

**Architecture:** Vite React 정적 사이트가 사람이 승인한 `src/content/approved.json`과 결정적으로 생성된 `src/generated/site-data.json`을 소비한다. `src/main.jsx`는 Hero, Story, Ability Map, Evidence, Works, Documents의 정보 순서를 렌더링하고 `src/styles.css`는 차콜·오렌지·크림 편집형 레이아웃과 반응형 가독성을 담당한다. 입력 데이터와 generator는 유지하되, 숫자는 story 이후의 축소된 근거 영역에서만 사용한다.

**Tech Stack:** React, Vite, plain CSS, Node.js scripts, JSON inputs, DOCX/PDF artifacts, CUA browser verification.

**Spec:** `docs/superpowers/specs/2026-09-17-profile-site-redesign-design.md`

**Implementation status (2026-09-18):** Tasks 1–4 are implemented and verified. Task 5 automated checks, ZIP re-run, local browser inspection at 1280px, and direct PDF/DOCX response checks are complete; 879px/390px visual confirmation and public HTTPS deployment remain user-side checks.

## Global Constraints

- 사실은 `assignment09_narrative.md`, `inputs/ritual-history.json`, `inputs/attendance.json`의 확인된 값에 한정한다.
- 자기소개 본편은 2022년 고난 → 바꾼 행동 → 2026년 현재의 순서를 지키고 1,300~1,500자 내외로 확장한다.
- 자기조절력·대인관계력·자기동기력은 날짜가 있는 실제 장면과 연결한다.
- 회복탄력성·과제지속력 숫자는 이야기 뒤 근거로만 배치한다.
- 출석률과 원자료 없는 제출률은 저장·생성·표시하지 않는다.
- 출석 보조 수치는 결석 0일, 확정 출석 26/27일, 9/17 확정 전 1일만 사용한다.
- 다른 사람의 실명·연락처와 비밀번호·토큰·API 키를 결과물에 넣지 않는다.
- 10번 논문은 PDF 링크를 유지하고 13번 앱은 링크 없는 준비 카드로 둔다.
- 공개 이메일과 HTTPS URL은 사용자가 확정하기 전까지 placeholder와 보류 상태로 둔다.
- 새 패키지와 외부 AI 호출은 추가하지 않는다.

---

### Task 1: 콘텐츠 계약과 자동 검증 추가

**Files:**
- Create: `scripts/content-check.mjs`
- Modify: `package.json`
- Modify: `src/content/approved.json`
- Test: `scripts/content-check.mjs`

**Interfaces:**
- `content-check.mjs` reads `src/content/approved.json` and exits non-zero when the approved story is too short, missing required dated scenes, missing one of the three abilities, or contains forbidden rate/placeholder output.
- `npm run check:content` runs `node scripts/content-check.mjs`.

- [x] **Step 1: Write the failing content assertions**

  Implement a small Node script with these exact checks:

  ```js
  const text = approved.story.map((chapter) => chapter.text).join('');
  assert(text.length >= 1200 && text.length <= 1650);
  assert(text.includes('2022년') && text.includes('2026년 8월 28일'));
  assert(text.includes('9월 7일') && text.includes('9월 8일') && text.includes('9월 9일'));
  for (const ability of ['자기조절력', '대인관계력', '자기동기력']) assert(approved.story.some((chapter) => chapter.ability === ability));
  assert(!JSON.stringify(approved).includes('출석률'));
  assert(!JSON.stringify(approved).includes('96.3%'));
  ```

- [x] **Step 2: Run the check against the current content**

  Run: `npm run check:content`

  Expected: FAIL because the current story text is approximately 568 characters.

- [x] **Step 3: Replace the approved story with the fact-checked long version**

  Use only the 9번 1인칭 완성본 and confirmed records. Keep three story chapters, but write the complete narrative in their `text` fields: 2022 Changwon PCB worksite hardship, greeting/questioning as the changed action, and 2026 dated listening/helping/reading/growth evidence. Do not include coworker names or invented task results.

- [x] **Step 4: Add content-check to package scripts and run it**

  Add `"check:content": "node scripts/content-check.mjs"` to `package.json`, then run `npm run check:content`.

  Expected: PASS and a concise report of story character count and the three matched abilities.

### Task 2: Story-first component structure

**Files:**
- Modify: `src/main.jsx`
- Test: `npm run build`

**Interfaces:**
- `App` consumes `approved` and generated metrics without changing the generator output contract.
- `Metric` remains available for evidence rows but is no longer used as a hero statistic board.

- [x] **Step 1: Remove metric emphasis from Hero**

  Keep the name, one-line introduction, two CTAs, and the right-side `질문 → 확인 → 공유` visual. Remove the hero stats block and any decorative route line. The right panel may show the small `2022—2026` range as explanatory caption only.

- [x] **Step 2: Render the long story as the primary content**

  Keep three dated chapters in `#story`. Show each chapter’s date, period, ability, ability short description, long fact-checked paragraph, and a short “기억해 둔 변화” sentence. Add a clear visual hierarchy so the paragraph is wider than its metadata.

- [x] **Step 3: Replace the duplicate ability rows with a compact ability map**

  Render each ability once as a three-part summary: `그때`, `바꾼 행동`, `지금`. Link each row to its story chapter through the same date and source, without repeating the full story paragraph.

- [x] **Step 4: Replace the large proof board with a supporting evidence strip**

  Use the ritual metrics as the two primary evidence items: `실천했다고 남긴 날` for recovery and `기록을 연 날` for persistence. Show attendance values as smaller supporting source rows. Keep missing submissions as a quiet note and never display a submission percentage without `inputs/submissions.json`.

- [x] **Step 5: Keep works, documents, and update-device guidance subordinate**

  Preserve the 10번 PDF card, 13번 app placeholder, DOCX download, and add a compact four-step update-device note: `새 기록 → 후보 생성 → 사람 승인 → 빌드`.

- [x] **Step 6: Run the build before styling**

  Run: `npm run build`

  Expected: Vite exits 0 and the new JSX renders without missing property errors.

### Task 3: Full visual hierarchy and responsive CSS

**Files:**
- Modify: `src/styles.css`
- Modify: `index.html`

**Interfaces:**
- CSS keeps the existing color tokens and font imports, with explicit focus, contrast, and reduced-motion rules.
- Breakpoints must support 1280px, 879px, 600px, and 390px widths without horizontal overflow.

- [x] **Step 1: Establish section hierarchy tokens**

  Use the existing black `#08090A`, charcoal `#121416`, orange `#FF6A00`, paper `#F4F1E8`, and body gray `#35393E`. Make section headings large but keep body text at readable sizes and line lengths below 80 characters.

- [x] **Step 2: Make story the dominant visual area**

  Give `story-section` the largest vertical rhythm. Use a date rail, ability column, and spacious text column with a separator; at mobile, stack date, ability, and text in one readable column.

- [x] **Step 3: Make the ability map legible without a full orange text wall**

  Keep the orange mood as a band, but place the three summaries in high-contrast paper/charcoal blocks or clearly separated rows. Body copy must be at least `0.9rem` at desktop and source text at least `0.68rem`.

- [x] **Step 4: Reduce evidence to a visual footnote**

  Use one featured ritual number and compact supporting rows rather than four equal metric cards. Make source labels readable but visually secondary to story copy.

- [x] **Step 5: Add interaction and accessibility polish**

  Preserve one restrained reveal sequence, add `:focus-visible`, maintain reduced-motion behavior, and verify links have clear action names. Remove any decorative element whose meaning is not visible from its label.

- [x] **Step 6: Run a production build**

  Run: `npm run build`

  Expected: PASS with no CSS parse errors.

### Task 4: Documents, checklist, and package synchronization

**Files:**
- Modify: `scripts/create_application_doc.py`
- Modify: `checklist.md`
- Modify: `docs/content-review.md`
- Modify: `docs/ai-human-judgment.md`
- Modify: `BR-A-README.md`
- Regenerate: `deliverables/김태빈_지원서_묶음.docx`
- Regenerate: `deliverables/김태빈_BR-A_갱신장치.zip`

**Interfaces:**
- The DOCX uses the same fact-checked story order and three ability mapping as `approved.json`.
- `checklist.md` distinguishes `완료`, `부분 완료`, `사용자 확인 필요`, and `미완료`; it must not claim the whole submission is complete while HTTPS/email/submission source are missing.

- [x] **Step 1: Update the document generator’s self-introduction body**

  Replace the shorter or older story copy with the same long fact-checked narrative used by the site, while keeping the resume and S-A-R career description sections.

- [x] **Step 2: Update the review and judgment documents**

  Record that the story is primary, numbers are evidence, attendance rate is intentionally excluded, and missing submissions are not fabricated.

- [x] **Step 3: Update the checklist status and design QA rows**

  Mark C01–C12 and C21 according to actual evidence, retain C05 partial while `submissions.json` is absent, and retain C13/C20/user email as incomplete or user-confirmation items. Add checks for story length, number hierarchy, 1280/879/390 readability, and no horizontal overflow.

- [x] **Step 4: Rebuild DOCX, generate outputs, and run privacy check**

  Run: `python scripts/create_application_doc.py`, `npm run generate`, `npm run check:content`, `npm run check:privacy`.

  Expected: the DOCX and public document copy exist, generated metrics contain no attendance rate, content check passes, and privacy check passes.

- [x] **Step 5: Rebuild the ZIP from the current source**

  Include `src/`, `scripts/`, `inputs/`, `docs/`, `public/`, `README.md`, `BR-A-README.md`, package files, checklist, and generated outputs. Exclude `node_modules`, `.git`, temporary verification folders, and credentials.

### Task 5: End-to-end verification and handoff

**Files:**
- Verify: `dist/`, `checklist.md`, `deliverables/김태빈_BR-A_갱신장치.zip`
- Verify: local browser at `http://127.0.0.1:5174/`

- [x] **Step 1: Run all automated checks in the project**

  Run:

  ```powershell
  npm run generate
  npm run test:generator
  npm run check:content
  npm run check:privacy
  npm run build
  ```

  Expected: all commands exit 0; generator outputs are byte-identical in its test; no attendance rate or secret is found.

- [ ] **Step 2: Verify the browser at three widths**

  Inspect 1280px, 879px, and 390px. Confirm the first screen prioritizes name/story CTA, story text is not clipped, the three ability names appear beside dated scenes, evidence is visually secondary, and works/documents remain reachable.

- [x] **Step 3: Verify links and runtime behavior**

  Open the paper PDF and DOCX links in fresh tabs without authentication. Confirm no console errors, no horizontal overflow, no `96.3%`, no `출석률`, and no `.hero-route` element.

- [x] **Step 4: Verify the ZIP in a new folder**

  Expand the ZIP to a new folder, run `npm ci --offline`, `npm run generate`, `npm run test:generator`, `npm run check:content`, `npm run check:privacy`, and `npm run build`. Compare the generated output and confirm the result matches the source package.

- [x] **Step 5: Update checklist with actual evidence**

  Record command results, browser widths, remaining user actions, and final artifact paths. Do not mark HTTPS URL or public email complete without user-provided values.
