import jwt from 'jsonwebtoken';

// Единая точка проверки JWT для HTTP, WebSocket и REST-эндпоинтов.
// Возвращает payload токена ({ id, userLevel, seasonId, groupId }) или null.
export function getAuthFromHeader(authHeader) {
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function isStaff(auth) {
  return auth?.userLevel === 'ADMIN' || auth?.userLevel === 'TEACHER';
}

export function requireAuth(context) {
  if (!context?.auth) throw new Error('Не авторизован');
  return context.auth;
}

export function requireStaff(context) {
  const auth = requireAuth(context);
  if (!isStaff(auth)) throw new Error('Доступ запрещен');
  return auth;
}

export function requireAdmin(context) {
  const auth = requireAuth(context);
  if (auth.userLevel !== 'ADMIN') throw new Error('Доступ запрещен');
  return auth;
}

// Действие от собственного имени; персонал может действовать от чужого
// (учитель сканирует QR студента, админ правит аватар и т.п.).
export function requireSelfOrStaff(context, userId) {
  const auth = requireAuth(context);
  if (String(auth.id) !== String(userId) && !isStaff(auth)) {
    throw new Error('Доступ запрещен');
  }
  return auth;
}
