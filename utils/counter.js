let counter = Date.now(); // seed with timestamp to avoid collisions with existing codes

export async function getNextId() {
  return ++counter;
}
