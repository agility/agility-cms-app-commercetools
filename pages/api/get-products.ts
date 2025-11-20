import { createCommercetoolsClient } from "@/lib/commercetools-client";
import { ProductSearchRequest } from "@commercetools/platform-sdk";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const projectKey = `${request.query.projectKey || ''}`;
    const clientId = `${request.query.clientId || ''}`;
    const clientSecret = `${request.query.clientSecret || ''}`;
    const region = `${request.query.region || ''}`;
    const offset = parseInt(`${request.query.offset || '0'}`);
    const locale = `${request.query.locale || 'en-US'}`;
    const search = `${request.query.search || ''}`.replaceAll("\"", "").trim();

    // Validate required parameters
    if (!projectKey || !clientId || !clientSecret || !region) {
      return response.status(400).json({
        error: 'Missing required parameters: projectKey, clientId, clientSecret, region'
      });
    }

    // Create the commercetools API client
    const apiRoot = createCommercetoolsClient({
      projectKey,
      clientId,
      clientSecret,
      region,
    });

    let result: any;
    let useSearchApi = false;

    // If searching (and search is not empty), try to use search APIs first
    if (search && search.length > 0) {
      // Try Product Projection Search first
      try {
        result = await apiRoot
          .productProjections()
          .search()
          .get({
            queryArgs: {
              limit: 25,
              offset,
              'text.en-US': search,
            },
          })
          .execute();
        useSearchApi = true;
      } catch (projectionSearchError: any) {

        // Check if Product Projection Search is disabled
        const isProjectionDisabled = projectionSearchError?.statusCode === 400 &&
          projectionSearchError?.body?.message?.includes('endpoint is deactivated');

        if (isProjectionDisabled) {
          // Try Product Search instead
          try {
            const searchBody: ProductSearchRequest = {
              limit: 25,
              offset,
              query: {
                or: [
                  {
                    fullText: {
                      field: 'name',
                      language: locale,
                      value: search,
                    },
                  },
                  {
                    fullText: {
                      field: 'description',
                      language: locale,
                      value: search,
                    },
                  },
                  {
                    fullText: {
                      field: 'slug',
                      language: locale,
                      value: search,
                    },
                  },
                  {
                    prefix: {
                      field: 'key',
                      language: locale,
                      value: search,
                      caseInsensitive: true,
                    },
                  },
                  {
                    prefix: {
                      field: 'variants.sku',
                      value: search,
                      caseInsensitive: true,
                    },
                  },
                  {
                    prefix: {
                      field: 'variants.key',
                      value: search,
                      caseInsensitive: true,
                    },
                  },
                ],
              },
              productProjectionParameters: {
                expand: ['productType'],
                staged: false,
              },
            };
            result = await apiRoot
              .products()
              .search()
              .post({
                body: searchBody
              })
              .execute();
            useSearchApi = true;
          } catch (productSearchError: any) {
            // Both search APIs failed, fall back to client-side filtering
            useSearchApi = false;
          }
        } else {
          // Some other error occurred, rethrow it
          throw projectionSearchError;
        }
      }
    }

    // If not searching or search APIs failed, use regular products().get()
    if (!useSearchApi) {
      const queryArgs: any = {
        limit: search ? 100 : 25,
        offset: search ? 0 : offset,
      };

      result = await apiRoot
        .products()
        .get({
          queryArgs,
        })
        .execute();
    }

    // Transform the results to match the expected format
    let transformedResults = result.body.results.map((product: any) => {
      // Handle different response structures:
      // 1. Product Search API: returns { id, productProjection }
      // 2. Product Projection Search: returns product projection directly
      // 3. Regular products().get(): returns { id, masterData: { current: ... } }
      const current = product.productProjection || product.masterData?.current || product;

      // Extract localized values (name and slug are objects with locale keys)
      const name = current.name?.[locale] || current.name?.['en-US'] || Object.values(current.name || {})[0] || '';
      const slug = current.slug?.[locale] || current.slug?.['en-US'] || Object.values(current.slug || {})[0] || '';

      return {
        id: product.id,
        name,
        slug,
        allVariants: [
          current.masterVariant,
          ...(current.variants || [])
        ],
        categories: current.categories,
        productType: current.productType || product.productType,
      };
    });

    // If searching with client-side filtering, filter results by name (case-insensitive)
    if (search && !useSearchApi) {
      const searchLower = search.toLowerCase();
      transformedResults = transformedResults.filter((product: any) =>
        product.name.toLowerCase().includes(searchLower)
      );

      // Apply pagination after filtering
      const start = offset;
      const end = offset + 25;
      const paginatedResults = transformedResults.slice(start, end);

      return response.status(200).json({
        total: transformedResults.length,
        count: paginatedResults.length,
        results: paginatedResults,
      });
    }

    // Cache the product listing for this query for 5 minutes
    response.setHeader('Cache-Control', 's-maxage=300');

    return response.status(200).json({
      total: result.body.total,
      count: result.body.count,
      results: transformedResults,
    });

  } catch (error: any) {
    console.error('Error fetching products from commercetools:', error);

    // Extract meaningful error message from commercetools response
    const errorMessage = error?.body?.message || error?.message || 'Unknown error';
    const statusCode = error?.statusCode || error?.body?.statusCode || 500;

    return response.status(statusCode).json({
      error: 'Failed to fetch products',
      message: errorMessage,
      details: error?.body?.errors || []
    });
  }
}

