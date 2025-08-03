// Custom Jest sequencer to run tests in a specific order
const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Sort tests to run login tests first, then dashboard tests
    const testOrder = [
      'login.test.js',
      'dashboard.test.js'
    ];
    
    return tests.sort((testA, testB) => {
      const indexA = testOrder.findIndex(name => testA.path.includes(name));
      const indexB = testOrder.findIndex(name => testB.path.includes(name));
      
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });
  }
}

module.exports = CustomSequencer;
