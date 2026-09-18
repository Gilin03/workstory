import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
  const args = { input: 'inputs', output: 'src/generated' };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--input') args.input = argv[++index];
    if (argv[index] === '--output') args.output = argv[++index];
  }
  return args;
}

function safeText(value) {
  return String(value ?? '')
    .replace(/\([^)]*이름[^)]*\)/g, '(이름 가림)')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[이메일 가림]')
    .replace(/\b(?:sk|pk|api|token|secret)[_-]?[A-Za-z0-9_-]{12,}\b/gi, '[비밀값 가림]');
}

function fieldValue(entries, prefix) {
  const match = entries.find((entry) => String(entry).startsWith(prefix));
  return match ? String(match).slice(prefix.length).trim() : '';
}

function ritualMetrics(ritual, sourcePath) {
  const days = Array.isArray(ritual?.days) ? ritual.days : [];
  const openDays = days.filter((day) => Array.isArray(day.open)).length;
  const closeDays = days.filter((day) => Array.isArray(day.close)).length;
  const successes = days.filter((day) => Array.isArray(day.close) && day.close.some((entry) => /강점 행동:\s*실천했다/.test(String(entry)))).length;
  const latest = [...days].reverse().find((day) => Array.isArray(day.open));
  const interpersonal = [...days].reverse().find((day) => Array.isArray(day.open) && /도움|소통|설명|함께/.test(day.open.join(' ')));
  const motivation = [...days].reverse().find((day) => Array.isArray(day.open) && /끝까지|해결|포기하지/.test(day.open.join(' ')));
  return {
    sourceFiles: [sourcePath],
    metrics: [
      { id: 'ritual-open-days', label: '기록을 연 날', value: openDays, displayValue: `${openDays}일`, source: '리추얼 기록', evidence: `${sourcePath} · days[].open` },
      { id: 'ritual-close-days', label: '마감 기록', value: closeDays, displayValue: `${closeDays}회`, source: '리추얼 기록', evidence: `${sourcePath} · days[].close` },
      { id: 'ritual-successes', label: '실천했다고 남긴 날', value: successes, displayValue: `${successes}회`, source: '리추얼 기록', evidence: `${sourcePath} · close의 ‘강점 행동: 실천했다’` },
    ],
    latestEvidence: latest ? {
      date: latest.date,
      source: '리추얼 기록',
      field: '강점이 드러난 일화',
      excerpt: safeText(fieldValue(latest.open, '강점이 드러난 일화:')),
    } : null,
    candidates: [
      {
        ability: '자기조절력',
        date: latest?.date ?? null,
        text: latest ? `${latest.date} 기록에서 오늘 할 일을 먼저 정리하고 바로 행동한 장면은, 감정을 없애기보다 다음 행동으로 조절하는 자기조절력을 보여준다. 근거: ${sourcePath} · days[${days.indexOf(latest)}].open의 ‘오늘의 첫 행동’.` : '리추얼 기록이 없어 자기조절력 후보를 만들 수 없다.',
      },
      {
        ability: '대인관계력',
        date: interpersonal?.date ?? null,
        text: interpersonal ? `${interpersonal.date} 기록에서 주변 사람과 소통하고 먼저 도움을 주고받은 장면은, 혼자 버티는 대신 함께 해결하는 대인관계력을 보여준다. 근거: ${sourcePath} · days[${days.indexOf(interpersonal)}].open.` : '대인관계 장면을 찾지 못했다.',
      },
      {
        ability: '자기동기력',
        date: motivation?.date ?? null,
        text: motivation ? `${motivation.date} 기록에서 오류의 원인을 하나씩 확인하고 끝까지 해결하려 한 장면은, 완벽한 확신을 기다리지 않는 자기동기력을 보여준다. 근거: ${sourcePath} · days[${days.indexOf(motivation)}].open.` : '자기동기력 장면을 찾지 못했다.',
      },
    ],
  };
}

function attendanceMetrics(attendance, sourcePath) {
  const records = Array.isArray(attendance?.records) ? attendance.records : [];
  const summary = attendance?.summary && typeof attendance.summary === 'object' ? attendance.summary : null;
  const asOf = typeof attendance?.asOf === 'string' && attendance.asOf.trim() ? attendance.asOf.trim() : null;
  const scheduled = Number.isFinite(Number(summary?.trainingDays))
    ? Number(summary.trainingDays)
    : records.filter((record) => record.scheduled !== false).length;
  const attended = Number.isFinite(Number(summary?.attendedDays))
    ? Number(summary.attendedDays)
    : records.filter((record) => record.attended === true || /출석|참석|present|attended/i.test(String(record.status))).length;
  const absent = Number.isFinite(Number(summary?.absentDays))
    ? Number(summary.absentDays)
    : Math.max(scheduled - attended, 0);
  const pending = Number.isFinite(Number(summary?.pendingDays)) ? Number(summary.pendingDays) : 0;
  const evidenceBase = summary ? `${sourcePath} · summary` : `${sourcePath} · records[].attended/status`;
  const detail = pending ? `확정 출석 ${attended}/${scheduled}일 · 오늘 확정 전 ${pending}일` : `확정 출석 ${attended}/${scheduled}일`;
  return [
    { id: 'attendance-absence', label: '결석', value: absent, displayValue: `${absent}일`, detail, source: '내 출석 기록', evidence: `${evidenceBase}.absentDays`, asOf },
    { id: 'attendance-confirmed', label: '확정 출석', value: attended, displayValue: `${attended}/${scheduled}일`, detail, source: '내 출석 기록', evidence: `${evidenceBase}.attendedDays/trainingDays`, asOf },
  ];
}

function submissionMetrics(submissions, sourcePath) {
  const records = Array.isArray(submissions?.assignments) ? submissions.assignments : [];
  const submitted = records.filter((record) => record.submitted === true || /제출|완료|submitted|complete/i.test(String(record.status))).length;
  const rate = records.length ? Math.round((submitted / records.length) * 1000) / 10 : 0;
  const asOf = typeof submissions?.asOf === 'string' && submissions.asOf.trim() ? submissions.asOf.trim() : null;
  return {
    id: 'submission-rate',
    label: '과제 제출 현황',
    value: rate,
    displayValue: `${submitted}/${records.length}개`,
    detail: `제출 완료 ${submitted}/${records.length}개 · ${rate}%`,
    source: '내 제출 현황',
    evidence: `${sourcePath} · assignments[].submitted/status`,
    asOf,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputDir = path.resolve(args.input);
  const outputDir = path.resolve(args.output);
  fs.mkdirSync(outputDir, { recursive: true });
  const ritualPath = path.join(inputDir, 'ritual-history.json');
  const ritual = fs.existsSync(ritualPath) ? readJson(ritualPath) : null;
  const sourcePath = path.relative(process.cwd(), ritualPath).replaceAll('\\', '/');
  const result = ritual ? ritualMetrics(ritual, sourcePath) : { sourceFiles: [], metrics: [], latestEvidence: null, candidates: [] };
  const missingSources = [];
  const attendancePath = path.join(inputDir, 'attendance.json');
  const submissionsPath = path.join(inputDir, 'submissions.json');
  const attendanceSource = path.relative(process.cwd(), attendancePath).replaceAll('\\', '/');
  const submissionsSource = path.relative(process.cwd(), submissionsPath).replaceAll('\\', '/');
  if (fs.existsSync(attendancePath)) {
    result.metrics.push(...attendanceMetrics(readJson(attendancePath), attendanceSource));
    result.sourceFiles.push(attendanceSource);
  }
  else missingSources.push({ source: '내 출석 기록', path: attendanceSource, message: '원자료를 넣으면 결석·확정 출석 숫자를 계산할 수 있습니다.' });
  if (fs.existsSync(submissionsPath)) {
    result.metrics.push(submissionMetrics(readJson(submissionsPath), submissionsSource));
    result.sourceFiles.push(submissionsSource);
  }
  else missingSources.push({ source: '내 제출 현황', path: submissionsSource, message: '원자료를 넣으면 제출률을 계산할 수 있습니다.' });
  result.metrics.sort((a, b) => a.id.localeCompare(b.id));
  result.sourceFiles = [...new Set(result.sourceFiles)].sort();
  result.missingSources = missingSources;
  // Derive the as-of date from the input instead of the clock so identical
  // inputs produce identical bytes even when the script runs on another day.
  result.generatedAt = result.latestEvidence?.date ?? null;
  const siteData = { generatedAt: result.generatedAt, sourceFiles: result.sourceFiles, metrics: result.metrics, missingSources: result.missingSources, latestEvidence: result.latestEvidence };
  fs.writeFileSync(path.join(outputDir, 'site-data.json'), `${JSON.stringify(siteData, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'metrics.json'), `${JSON.stringify(siteData.metrics, null, 2)}\n`, 'utf8');
  const candidateMarkdown = [
    '# 문단 후보',
    '',
    '이 파일은 자동 후보입니다. 승인한 문장만 `src/content/approved.json`에 반영합니다.',
    '',
    ...result.candidates.flatMap((candidate) => [`## ${candidate.ability}`, `- 날짜: ${candidate.date ?? '없음'}`, `- ${candidate.text}`, '']),
  ].join('\n');
  fs.writeFileSync(path.join(outputDir, 'candidates.md'), `${candidateMarkdown}\n`, 'utf8');
  console.log(JSON.stringify({ output: path.relative(process.cwd(), outputDir), metrics: siteData.metrics.length, missingSources: missingSources.length }, null, 2));
}

main();
