import { json } from '@sveltejs/kit';

const SELECT_URL = "https://form24.es/en/lote/select";
const POST_URL = "https://form24.es/en/get/lote";

const FORM_DATA = {
	"provinces": "Barcelona",
	"officine": "webparainmigrantes.com/numero-lote-nie-mallorca-213-de-barcelona/",
	"usr_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15",
	"officine_id": "56"
};

const headers = {
	"User-Agent": FORM_DATA.usr_agent,
	"Referer": SELECT_URL,
	"Origin": "https://form24.es",
	"Accept": "*/*",
};

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		// Step 1: Get the page to extract CSRF token
		const selectResponse = await fetch(SELECT_URL, { headers });
		if (!selectResponse.ok) {
			throw new Error(`Failed to fetch select page: ${selectResponse.status}`);
		}
		
		const html = await selectResponse.text();
		
		// Extract CSRF token using regex (since we can't use BeautifulSoup)
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
		
		// Step 3: Make POST request
		const postResponse = await fetch(POST_URL, {
			method: 'POST',
			headers: {
				...headers,
				// Don't set Content-Type when using FormData
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
			error: error.message 
		}, { 
			status: 500 
		});
	}
}
