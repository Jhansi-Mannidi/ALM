import { USERS, ROLE_USERS, PROJECTS as SEED_PROJECTS, NOTIFS as SEED_NOTIFS } from './data/seed.js';

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

export const users = clone(USERS);
const seedReportsTo = new Map(USERS.map((u) => [u.id, u.reportsTo ?? '']));
for (const u of users) {
  if (!u.reportsTo && seedReportsTo.get(u.id)) {
    u.reportsTo = seedReportsTo.get(u.id);
  }
}
export const roleUsers = clone(ROLE_USERS);
export let projects = clone(SEED_PROJECTS);
export let notifications = clone(SEED_NOTIFS);

export function findProject(id) {
  return projects.find((p) => p.id === id);
}

export function findUser(id) {
  return users.find((u) => u.id === id);
}
