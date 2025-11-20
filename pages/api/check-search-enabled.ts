import { createCommercetoolsClient } from "@/lib/commercetools-client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const projectKey = `${request.query.projectKey || ''}`;
    const clientId = `${request.query.clientId || ''}`;
    const clientSecret = `${request.query.clientSecret || ''}`;
    const region = `${request.query.region || ''}`;

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

    // Try Product Projection Search first
    try {
      await apiRoot
        .productProjections()
        .search()
        .get({
          queryArgs: {
            limit: 1,
          },
        })
        .execute();

      // If we get here, Product Projection Search is enabled
      return response.status(200).json({
        enabled: true,
        searchType: 'productProjections',
        message: 'Product Projection Search endpoint is enabled'
      });

    } catch (projectionSearchError: any) {
      // Check if Product Projection Search is disabled
      const isProjectionDisabled = projectionSearchError?.statusCode === 400 &&
        projectionSearchError?.body?.message?.includes('endpoint is deactivated');

      if (!isProjectionDisabled) {
        // Some other error occurred with Product Projection Search
        throw projectionSearchError;
      }

      // Product Projection Search is disabled, try Product Search
      try {
        await apiRoot
          .products()
          .search()
          .post({
            body: {
              limit: 1,
            },
          })
          .execute();

        // If we get here, Product Search is enabled
        return response.status(200).json({
          enabled: true,
          searchType: 'products',
          message: 'Product Search endpoint is enabled'
        });

      } catch (productSearchError: any) {
        // Check if Product Search is also disabled
        if (productSearchError?.statusCode === 400 &&
          productSearchError?.body?.message?.includes('endpoint is deactivated')) {
          return response.status(200).json({
            enabled: false,
            message: 'Neither Product Search nor Product Projection Search endpoints are enabled',
            instructions: 'To enable search, you need to enable either the Product Search or Product Projection Search endpoint in your commercetools Merchant Center under Project Settings > APIs, or <a target="_blank" href="https://support.commercetools.com/contact">contact commercetools support</a>.'
          });
        }

        // Some other error occurred with Product Search
        throw productSearchError;
      }
    }

  } catch (error: any) {
    console.error('Error checking search status:', error);

    const errorMessage = error?.body?.message || error?.message || 'Unknown error';
    const statusCode = error?.statusCode || error?.body?.statusCode || 500;

    return response.status(statusCode).json({
      error: 'Failed to check search status',
      message: errorMessage,
      details: error?.body?.errors || []
    });
  }
}
