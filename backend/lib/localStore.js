const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '../data/db.json');

const DEFAULT_DB = {
  users: [],
  books: [],
  userBooks: [],
  highlights: [],
  todos: [],
  events: [],
  teachers: [],
  teacherSessions: [],
  teacherChatMessages: [],
  avatarJobs: [],
  notifications: [],
  messages: [],
  homework: [],
  homeworkPacks: [],
  homeworkAttempts: [],
  exams: [],
  transactions: [],
  feeInvoices: [],
  payments: [],
  receipts: [],
  paymentIssues: [],
  otps: [],
  botMemories: [],
  botQuota: [],
  chatRequests: [],
  blocks: []
};

let writeQueue = Promise.resolve();

async function ensureDbFile() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
}

async function readDb() {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  return { ...DEFAULT_DB, ...parsed };
}

async function writeDb(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

async function withDb(mutator) {
  let result;
  writeQueue = writeQueue.then(async () => {
    const db = await readDb();
    result = await mutator(db);
    await writeDb(db);
  });
  await writeQueue;
  return result;
}

function createId() {
  return crypto.randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

function makeRecord(data = {}) {
  const timestamp = nowIso();
  return {
    _id: createId(),
    createdAt: timestamp,
    updatedAt: timestamp,
    ...data
  };
}

function touchRecord(record, patch = {}) {
  return {
    ...record,
    ...patch,
    updatedAt: nowIso()
  };
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function monthKey(date = new Date()) {
  return new Date(date).toISOString().slice(0, 7);
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

module.exports = {
  DEFAULT_DB,
  readDb,
  withDb,
  createId,
  makeRecord,
  touchRecord,
  normalizeEmail,
  monthKey,
  nowIso,
  toNumber
};
