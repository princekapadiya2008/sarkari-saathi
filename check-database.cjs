const { DatabaseSync } = require('node:sqlite');

const path = 'server/data-integrity-test/sarkari-saathi.db';

try {
  const db = new DatabaseSync(path, { readOnly: true });

  console.log('Integrity check:');
  console.log(db.prepare('PRAGMA integrity_check').all());

  console.log('Database tables:');
  console.log(
    db.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
    ).all()
  );

  db.close();
} catch (error) {
  console.error('DATABASE CHECK FAILED:', error.message);
  process.exitCode = 1;
}
