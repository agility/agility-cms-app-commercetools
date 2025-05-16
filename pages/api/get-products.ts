
import { getGQLClient } from "@/lib/get-gql-client";
import { gql } from "@apollo/client";

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

  const storeUrl = `${request.query.storeUrl}`
  const offset = `${request.query.offset}`
  const locale = `${request.query.locale}`
  const token = (request.headers.authorization || '').replace('Bearer ', '')
  const search = `${request.query.search || ''}`.replaceAll("\"", "")
  const client = getGQLClient({ storeUrl, token })


  const { data } = await client.query({

    query: gql`
  query ProductListing  ($locale: Locale = "en-US", $query: String = "", $offset: Int = 0) {
  productProjectionSearch(staged: true, locale: $locale, text: $query, offset: $offset, limit:25) {
    total
    count
    results {
      id
      name(locale: $locale)
      slug(locale: $locale)
      allVariants {
        sku
        images {
          url
          label
        }
        prices {
          value {
            currencyCode
            centAmount
          }
        }
      }
      categories {
        name(locale: $locale)
      }
      productType {
        name
      }
    }
  }
}
`,
    variables: {
      locale,
      query: search,
      offset: offset ? parseInt(offset) : 0
    }
  })

  //cache the product listing for this query for 5 minutes
  response.setHeader('Cache-Control', 's-maxage=300')

  const results = data?.productProjectionSearch || {}

  return response.status(200).json(results)


}

