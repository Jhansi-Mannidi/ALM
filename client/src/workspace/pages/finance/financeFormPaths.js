export function moduleNewPath(moduleKey, query = '') {
  return `/workspace/finance/m/${moduleKey}/new${query}`;
}

export function moduleEditPath(moduleKey, id) {
  return `/workspace/finance/m/${moduleKey}/${id}/edit`;
}

export function moduleListPath(moduleKey) {
  return `/workspace/finance/m/${moduleKey}`;
}
