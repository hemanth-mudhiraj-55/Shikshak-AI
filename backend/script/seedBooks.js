const { withDb } = require('../lib/localStore');

async function resetBooks() {
  await withDb(async (db) => {
    db.books = [];
    db.userBooks = [];
    db.highlights = [];
  });

  console.log('Local book data cleared from backend/data/db.json');
}

resetBooks().catch((error) => {
  console.error('Failed to reset local book data:', error);
  process.exit(1);
});
