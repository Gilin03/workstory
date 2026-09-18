import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const approvedPath = path.join(root, 'src', 'content', 'approved.json');
const approved = JSON.parse(fs.readFileSync(approvedPath, 'utf8'));
const story = Array.isArray(approved.story) ? approved.story : [];
const storyText = story.map((chapter) => String(chapter.text ?? '')).join('');
const requiredAbilities = ['자기조절력', '대인관계력', '자기동기력'];
const serialized = JSON.stringify(approved);

assert.equal(story.length, 3, 'story must contain three dated chapters');
assert(storyText.length >= 1200 && storyText.length <= 1650, `story length must be 1200–1650 characters (got ${storyText.length})`);
assert(storyText.includes('2022년'), 'story must include the 2022 hardship');
for (const date of ['2026년 8월 28일', '9월 7일', '9월 8일', '9월 9일']) {
  assert(storyText.includes(date), `story must include ${date}`);
}
for (const ability of requiredAbilities) {
  assert(story.some((chapter) => chapter.ability === ability), `story must map ${ability} to a chapter`);
}
assert(!serialized.includes('출석률'), 'approved content must not contain attendance-rate copy');
assert(!serialized.includes('96.3%'), 'approved content must not contain the screenshot rate');
assert(!serialized.includes('submission-rate'), 'approved content must not contain an unverified submission rate');

console.log(JSON.stringify({ storyCharacters: storyText.length, abilities: requiredAbilities }, null, 2));
