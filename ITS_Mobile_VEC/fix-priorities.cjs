const fs = require('fs');
const DATA_PATH = 'd:/Etc/ITS_Mobile_VEC/docs/generated/its-mobile-vec-demo/content-data.json';

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const PMAP = {
  'Rat cao': 'Rất cao',
  'Cao': 'Cao',
  'Trung binh': 'Trung bình',
  'Thap': 'Thấp',
};

function fixPriority(p) {
  if (!p) return 'Trung bình';
  if (PMAP[p]) return PMAP[p];
  return p; // already correct (e.g., already accented)
}

let fixed = 0;
['ui', 'api'].forEach(sheet => {
  if (!data.test_cases || !data.test_cases[sheet]) return;
  data.test_cases[sheet].forEach(tc => {
    if (tc.priority && PMAP[tc.priority]) {
      tc.priority = PMAP[tc.priority];
      fixed++;
    }
  });
});

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed', fixed, 'priority values');
