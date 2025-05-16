
import { getGQLClient } from "@/lib/get-gql-client";
import { gql } from "@apollo/client";

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {


	const storeUrl = `${request.query.storeUrl}`
	const token = (request.headers.authorization || '').replace('Bearer ', '')
	const entityID = request.query.entityID || ''

	const client = getGQLClient({ storeUrl, token })
	const { data } = await client.query({

		query: gql`{
	 site {
		product(entityId: ${entityID}) {
			id
			entityId
			name
			plainTextDescription
			defaultImage {
				url(width: 640)
			}
			inventory {
				isInStock
				aggregated {
					availableToSell
					warningLevel
				}
			}
			availabilityV2 {
				status
				description
			}

			reviewSummary {
				summationOfRatings
				numberOfReviews
			}
			prices {
				price {
					value
					currencyCode
				}
			}
		}
	}
}
`})

	//cache the product for 5 minutes
	response.setHeader('Cache-Control', 's-maxage=300')
	return response.status(200).json(data.site?.product || null)


}

