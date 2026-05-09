import autocannon from 'autocannon';

const SHORT_CODE = process.argv[2] || 'test123';
const URL = `http://localhost:8000/${SHORT_CODE}`;

console.log(`Benchmarking: ${URL}\n`);

const result = await autocannon({
  url: URL,
  connections: 50,
  duration: 10,
  pipelining: 1,
});

console.log(autocannon.printResult(result));
