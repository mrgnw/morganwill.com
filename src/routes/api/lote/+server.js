import { json } from '@sveltejs/kit';

const SELECT_URL = "https://form24.es/en/lote/select";
const POST_URL = "https://form24.es/en/get/lote";

const FORM_DATA = {
	"provinces": "Barcelona",
	"officine": "webparainmigrantes.com/numero-lote-nie-mallorca-213-de-barcelona/",
	"usr_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15",
	"officine_id": "56"
};

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		// Step 1: Get the page to extract CSRF token and cookies
		const selectResponse = await fetch(SELECT_URL, { 
			headers: {
				'User-Agent': FORM_DATA.usr_agent,
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
				'Accept-Language': 'en-US,en;q=0.5',
				'Accept-Encoding': 'gzip, deflate, br',
				'DNT': '1',
				'Connection': 'keep-alive',
				'Upgrade-Insecure-Requests': '1',
			}
		});
		
		if (!selectResponse.ok) {
			throw new Error(`Failed to fetch select page: ${selectResponse.status}`);
		}
		
		const html = await selectResponse.text();
		
		// Extract cookies from the response headers
		const setCookieHeaders = selectResponse.headers.getSetCookie?.() || 
			(selectResponse.headers.get('set-cookie') ? [selectResponse.headers.get('set-cookie')] : []);
		
		// Parse cookies into a single Cookie header value
		const cookies = setCookieHeaders
			.map(cookie => cookie.split(';')[0]) // Take only the name=value part
			.join('; ');
		
		// Extract CSRF token using regex
		const tokenMatch = html.match(/<input[^>]*name="_token"[^>]*value="([^"]*)"[^>]*>/);
		if (!tokenMatch) {
			throw new Error("CSRF token not found");
		}
		
		const csrfToken = tokenMatch[1];
		
		// Step 2: Prepare form data
		const formData = new FormData();
		Object.entries(FORM_DATA).forEach(([key, value]) => {
			formData.append(key, value);
		});
		formData.append("_token", csrfToken);
		
		// Step 3: Make POST request with cookies
		const postResponse = await fetch(POST_URL, {
			method: 'POST',
			headers: {
				'User-Agent': FORM_DATA.usr_agent,
				'Referer': SELECT_URL,
				'Origin': 'https://form24.es',
				'Accept': 'application/json, text/plain, */*',
				'Cookie': cookies,
				'X-Requested-With': 'XMLHttpRequest',
			},
			body: formData
		});
		
		if (!postResponse.ok) {
			throw new Error(`POST request failed: ${postResponse.status}`);
		}
		
		const result = await postResponse.json();
		
		return json(result, {
			headers: {
				'Cache-Control': 'max-age=300' // Cache for 5 minutes
			}
		});
		
	} catch (error) {
		return json({ 
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { 
			status: 500 
		});
	}
}
