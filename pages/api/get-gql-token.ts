import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

	const store = request.query.store || ''
	const token = (request.headers.authorization || '').replace('Bearer ', '')

	const url = `https://api.bigcommerce.com/${store}/v3/storefront/api-token`

	const tokenRes = await fetch(url, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-Auth-Token': token
		},
		body: JSON.stringify({
			"allowed_cors_origins": [

			],
			"channel_id": 1,
			"expires_at": 1885635176
		})
	})

	if (tokenRes.ok) {
		const token = await tokenRes.json()

		//cache the gql token for 24 hours
		response.setHeader('Cache-Control', 's-maxage=86400')
		return response.status(200)
			.json(token?.data?.token || { token: null })

	} else {
		throw new Error("Error creating token")
	}
}