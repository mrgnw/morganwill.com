// minimal 'oneliner' blog
import { tsvParse } from 'd3-dsv';
import { url } from 'inspector';

var oneliners = [
	'experiments',
	'picks'
]

// fetch each oneliner
export async function load({ params }) {
	const { slug } = params;
	const topic = slug.toLowerCase();

	const url = `https://txt.xcc.es/${topic}.tsv`;

	const response = await fetch(url);
	const text = await response.text();
	const data = tsvParse(text);

	return {
		columns: data.columns,
		data: data
	};

}