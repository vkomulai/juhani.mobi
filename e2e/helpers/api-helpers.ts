const API_BASE = 'http://localhost:4000'

/**
 * Seed a shopping list in the backend.
 */
export async function seedListData(listId: string, items: Array<{ name: string, collected: boolean }>) {
  const response = await fetch(`${API_BASE}/list/${listId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(items)
  })
  if (!response.ok) {
    throw new Error(`Failed to seed list ${listId}: ${response.status}`)
  }
  return response.json()
}

/**
 * Retrieve a shopping list from the backend.
 */
export async function getListData(listId: string) {
  const response = await fetch(`${API_BASE}/list/${listId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  if (!response.ok) {
    throw new Error(`Failed to get list ${listId}: ${response.status}`)
  }
  return response.json()
}
