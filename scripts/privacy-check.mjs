import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const roots = ['src', 'public', 'docs', 'inputs', 'scripts'];
const allowed = new Set(['your-email@example.com']);
const approvedPath = path.resolve('src/content/approved.json');
if (fs.existsSync(approvedPath)) {
  const approved = JSON.parse(fs.readFileSync(approvedPath, 'utf8'));
  if (approved.contact?.email) allowed.add(approved.contact.email);
}
const secretPatterns = [
  /-----BEGIN [A-Z ]+PRIVATE KEY-----/,
  /(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"][^'"]{8,}/i,
  /(?:sk|pk)_[A-Za-z0-9]{20,}/,
  /Authorization:\s*Bearer\s+[A-Za-z0-9._-]{12,}/i,
];
const emailPattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const findings = [];

function walk(current) {
  if (!fs.existsSync(current)) return;
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const target = path.join(current, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (!entry.name.endsWith('.png') && !entry.name.endsWith('.jpg') && !entry.name.endsWith('.pdf') && !entry.name.endsWith('.docx')) {
      const text = fs.readFileSync(target, 'utf8');
      for (const pattern of secretPatterns) if (pattern.test(text)) findings.push(`${target}: secret-like value`);
      for (const email of text.match(emailPattern) ?? []) if (!allowed.has(email) && !email.includes('[이메일 가림]')) findings.push(`${target}: email ${email}`);
      if (/\b(?:password|비밀번호|전화번호|연락처)\s*[:：]\s*[^\s`]+/i.test(text) && !text.includes('연락처는 공개용')) findings.push(`${target}: possible personal contact value`);
    }
  }
}

for (const root of roots) walk(path.resolve(root));
if (findings.length) {
  console.error(findings.join('\n'));
  process.exit(1);
}
console.log(`privacy check passed: ${roots.join(', ')}`);
