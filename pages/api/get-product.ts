import { createCommercetoolsClient } from "@/lib/commercetools-client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const projectKey = `${request.query.projectKey || ''}`;
    const clientId = `${request.query.clientId || ''}`;
    const clientSecret = `${request.query.clientSecret || ''}`;
    const region = `${request.query.region || ''}`;
    const productId = `${request.query.productId || ''}`;
    const locale = `${request.query.locale || 'en-US'}`;

    // Validate required parameters
    if (!projectKey || !clientId || !clientSecret || !region) {
      return response.status(400).json({
        error: 'Missing required parameters: projectKey, clientId, clientSecret, region'
      });
    }

    if (!productId) {
      return response.status(400).json({
        error: 'Missing required parameter: productId'
      });
    }

    // Create the commercetools API client
    const apiRoot = createCommercetoolsClient({
      projectKey,
      clientId,
      clientSecret,
      region,
    });

    // Fetch product by ID using the SDK
    const result = await apiRoot
      .products()
      .withId({ ID: productId })
      .get()
      .execute();

    const product = result.body;
    const current = product.masterData.current;

    // Extract localized values
    const name = current.name[locale] || current.name['en-US'] || Object.values(current.name)[0] || '';
    const slug = current.slug[locale] || current.slug['en-US'] || Object.values(current.slug)[0] || '';
    const description = current.description?.[locale] || current.description?.['en-US'] || Object.values(current.description || {})[0] || '';

    // Get the master variant
    const masterVariant = current.masterVariant;

    // Extract image URLs
    const images = masterVariant.images || [];

    // Extract SKU
    const sku = masterVariant.sku || '';

    // Extract prices
    const prices = masterVariant.prices || [];
    const price = prices[0];

    // Extract attributes
    const attributes = masterVariant.attributes || [];

    // Fetch category details if there are any
    let categoryDetails: any[] = [];
    if (current.categories && current.categories.length > 0) {
      try {
        const categoryPromises = current.categories.map((catRef: any) =>
          apiRoot.categories().withId({ ID: catRef.id }).get().execute()
        );
        const categoryResults = await Promise.all(categoryPromises);
        categoryDetails = categoryResults.map((result: any) => {
          const cat = result.body;
          return {
            id: cat.id,
            key: cat.key,
            name: cat.name[locale] || cat.name['en-US'] || Object.values(cat.name)[0] || '',
            slug: cat.slug[locale] || cat.slug['en-US'] || Object.values(cat.slug)[0] || '',
          };
        });
      } catch (error) {
        console.error('Error fetching category details:', error);
        // If category fetch fails, just use the references
        categoryDetails = current.categories;
      }
    }

    // Transform to a detailed product response
    const transformedProduct = {
      id: product.id,
      key: product.key,
      version: product.version,
      productType: product.productType,
      name,
      slug,
      description,
      categories: categoryDetails,
      masterVariant: {
        id: masterVariant.id,
        sku,
        key: masterVariant.key,
        images: images.map((img: any) => ({
          url: img.url,
          label: img.label,
          dimensions: img.dimensions,
        })),
        attributes: attributes.reduce((acc: any, attr: any) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}),
        prices: prices.map((p: any) => ({
          value: p.value.centAmount,
          currencyCode: p.value.currencyCode,
          country: p.country,
        })),
        price: price ? {
          value: price.value.centAmount,
          currencyCode: price.value.currencyCode,
        } : null,
      },
      variants: current.variants?.map((variant: any) => ({
        id: variant.id,
        sku: variant.sku,
        key: variant.key,
        images: variant.images?.map((img: any) => ({
          url: img.url,
          label: img.label,
        })) || [],
        attributes: variant.attributes?.reduce((acc: any, attr: any) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}) || {},
      })) || [],
    };

    // Cache the product for 5 minutes
    response.setHeader('Cache-Control', 's-maxage=300');
    return response.status(200).json(transformedProduct);

  } catch (error: any) {
    console.error('Error fetching product from commercetools:', error);

    // Extract meaningful error message from commercetools response
    const errorMessage = error?.body?.message || error?.message || 'Unknown error';
    const statusCode = error?.statusCode || error?.body?.statusCode || 500;

    return response.status(statusCode).json({
      error: 'Failed to fetch product',
      message: errorMessage,
      details: error?.body?.errors || []
    });
  }
}
