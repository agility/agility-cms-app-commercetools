
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

	const store = request.query.store || ''
	const token = (request.headers.authorization || '').replace('Bearer ', '')

	const url = `https://api.bigcommerce.com/${store}/v2/store`

	const fetchRes = await fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-Auth-Token': token
		},
		//revalidate every 24 hours
		next: { revalidate: 86400 },
	})

	if (fetchRes.ok) {
		const res = await fetchRes.json()

		//Cache the store info for 24 hours
		response.setHeader('Cache-Control', 's-maxage=86400')
		return response.status(200).json(res || { res: null })
	} else {
		throw new Error("Error getting store info")
	}

}

