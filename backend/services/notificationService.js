const { makeRecord } = require('../lib/localStore');

function buildNotification({ userId, title, message, type = 'info', link = null, meta = null }) {
  return makeRecord({
    userId,
    title: String(title || '').trim(),
    message: String(message || '').trim(),
    type,
    link,
    meta,
    isRead: false,
    readAt: null
  });
}

function pushNotification(db, payload) {
  if (!payload?.userId) return null;
  const notification = buildNotification(payload);
  db.notifications.push(notification);
  return notification;
}

module.exports = {
  buildNotification,
  pushNotification
};

