#!/usr/bin/env node

const { DotaAutoexecGenerator } = require('../index.js');

async function main() {
  try {
    const generator = new DotaAutoexecGenerator();
    await generator.run();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();