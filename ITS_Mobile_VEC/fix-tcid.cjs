const fs = require('fs');
const DATA_PATH = 'd:/Etc/ITS_Mobile_VEC/docs/generated/its-mobile-vec-demo/content-data.json';
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

let fixed = 0;
['ui', 'api'].forEach(sheet => {
  if (!data.test_cases || !data.test_cases[sheet]) return;
  data.test_cases[sheet].forEach(tc => {
    if (tc.id && !tc.tc_id) {
      tc.tc_id = tc.id;
      fixed++;
    }
  });
});

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
console.log('Added tc_id to', fixed, 'test cases');
