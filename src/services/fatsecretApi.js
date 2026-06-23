/**
 * FatSecret food search – proxied through your own backend.
 *
 * WHY A PROXY?
 * FatSecret blocks requests from mobile device IPs (error code 21 –
 * "Invalid IP address detected"). The backend has a whitelisted static IP.
 * All /food/* endpoints on your Express server relay the calls to FatSecret.
 *
 * Backend routes added to back/index.js:
 *   GET /food/search?q=<query>&max=<n>
 *   GET /food/<id>
 */

import api_call from '../../api';   // e.g. 'http://10.241.222.235:5000'

// ── Food Search (via backend proxy) ──────────────────────────────────────────
/**
 * Search for foods by name.
 * @param {string} query      – search term
 * @param {number} maxResults – 1-50 (default 20)
 * @returns {Promise<Array>}  normalised food objects
 */
export const searchFood = async (query, maxResults = 20) => {
  if (!query || query.trim().length === 0) return [];

  const q   = encodeURIComponent(query.trim());
  const url = `${api_call}/food/search?q=${q}&max=${maxResults}`;

  console.log('[FoodSearch] Calling proxy:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Food search failed (HTTP ${response.status}): ${text}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`Food search error: ${data.error}`);
  }

  console.log('[FoodSearch] Got', data.results?.length, 'results for:', query);
  return data.results || [];
};

// ── Food Detail (via backend proxy) ──────────────────────────────────────────
/**
 * Get detailed nutrition for a single food by ID.
 * @param {string|number} foodId
 * @returns {Promise<Object>} raw FatSecret food.get.v2 response
 */
export const getFoodById = async (foodId) => {
  const url = `${api_call}/food/${encodeURIComponent(foodId)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Food detail failed (HTTP ${response.status}): ${text}`);
  }

  return response.json();
};
