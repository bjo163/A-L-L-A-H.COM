const Mocha = require('mocha');

async function run() {
  const mocha = new Mocha({ ui: 'tdd', color: true, timeout: 20_000 });
  mocha.addFile(`${__dirname}/extension.test.js`);
  await new Promise((resolve, reject) => {
    mocha.run((failures) => {
      if (failures > 0) reject(new Error(`${failures} extension-host test(s) failed.`));
      else resolve();
    });
  });
}

module.exports = { run };
