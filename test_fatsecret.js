/**
 * Quick FatSecret API test – run with: node test_fatsecret.js
 * Tests token fetch and food search without React Native.
 */

const FATSECRET_TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';
const FATSECRET_API_URL   = 'https://platform.fatsecret.com/rest/server.api';
const CLIENT_ID     = '197ebdcdca80403ebf89af543ac75dae';
const CLIENT_SECRET = 'd7c83897f7e94d9a9b41361ad760484a';

const buildQuery = (params) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

async function main() {
  console.log('=== FatSecret API Test ===\n');

  // 1. Fetch token
  console.log('1. Fetching OAuth2 token...');
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const tokenRes = await fetch(FATSECRET_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=basic',
  });

  const tokenText = await tokenRes.text();
  console.log('   Status:', tokenRes.status);
  console.log('   Body:', tokenText.slice(0, 300));

  if (!tokenRes.ok) {
    console.error('\n❌ Token fetch FAILED');
    process.exit(1);
  }

  const tokenData = JSON.parse(tokenText);
  const token = tokenData.access_token;
  console.log('   ✅ Token obtained (first 30 chars):', token.slice(0, 30) + '...');
  console.log('   Expires in:', tokenData.expires_in, 's\n');

  // 2. Search for food
  console.log('2. Searching for "chicken breast"...');
  const qs  = buildQuery({ format: 'json', method: 'foods.search', search_expression: 'chicken breast', max_results: 3, page_number: 0 });
  const url = `${FATSECRET_API_URL}?${qs}`;

  const searchRes = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const searchText = await searchRes.text();
  console.log('   Status:', searchRes.status);

  if (!searchRes.ok) {
    console.error('   ❌ Search FAILED:', searchText);
    process.exit(1);
  }

  const searchData = JSON.parse(searchText);

  if (searchData.error) {
    console.error('   ❌ API error:', searchData.error);
    process.exit(1);
  }

  const foods = searchData?.foods?.food;
  const foodArray = Array.isArray(foods) ? foods : [foods];
  console.log(`   ✅ Found ${foodArray.length} results:`);
  foodArray.forEach((f, i) => {
    console.log(`   [${i+1}] ${f.food_name} — ${f.food_description?.slice(0, 80)}`);
  });

  console.log('\n=== ALL TESTS PASSED ✅ ===');
}

main().catch(err => {
  console.error('\n❌ FATAL ERROR:', err.message);
  process.exit(1);
});
