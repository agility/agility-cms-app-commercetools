# CommerceTools App for Agility CMS

A custom field app for Agility CMS that enables content editors to browse, search, and attach CommerceTools products to their content items. Built using the [Agility Apps SDK v2](https://agilitycms.com/docs/apps/apps-sdk).

**App URL**: [https://commercetools-app.agilitycms.com/](https://commercetools-app.agilitycms.com/)
**Documentation**: [https://agilitycms.com/docs/apps/commercetools](https://agilitycms.com/docs/apps/commercetools)

## Overview

This app provides a seamless integration between Agility CMS and CommerceTools, allowing content editors to:
- Browse and search CommerceTools products directly within the Agility CMS interface
- Attach product information to content items using a custom field
- View product details including images, SKU, pricing, variants, and categories
- Access products via infinite scroll pagination for large catalogs

## Features

- **Custom Product Field**: Add a CommerceTools product picker field to any content definition in Agility CMS
- **Product Search**: Search products by name (when Product Projection Search is enabled)
- **Product Browser Modal**: Interactive product selection interface with infinite scroll
- **Product Details Display**: Rich product information display including:
  - Product images
  - SKU and product links to CommerceTools Merchant Center
  - Pricing information
  - Product variants
  - Categories
  - Product descriptions

## Prerequisites

Before installing this app, you need:

1. **CommerceTools Account** with:
   - Project Key
   - API Client credentials (Client ID and Client Secret)
   - Region (e.g., `us-central1.gcp`, `us-east-2.aws`, `europe-west1.gcp`)

2. **API Client Configuration**:
   - Create an API Client in CommerceTools developer settings
   - Grant read-only access to product data
   - Minimum required scope: `view_products:{projectKey}`

3. **Product Projection Search API** (Optional, for search functionality):
   - Enable via Merchant Center: Settings > Project settings > Storefront Search
   - Without this, the app will still work but search functionality will be disabled

## Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd agility-cms-app-commercetools
npm install
```

### 2. Run in Development Mode

```bash
npm run dev
```

The app will run on [http://localhost:3011](http://localhost:3011)

### 3. Configure in Agility CMS

1. Navigate to Settings > Apps in your Agility CMS instance
2. Install the CommerceTools app
3. Configure the following settings:
   - **Project Key**: Your CommerceTools project key
   - **Client ID**: Your API client ID
   - **Client Secret**: Your API client secret
   - **Region**: Your CommerceTools region
   - **Locale**: Your product locale (e.g., `en-US`)

### 4. Add the Field to Your Content Definitions

1. Go to Settings > Content Definitions
2. Edit a content definition
3. Add a new field and select "Commerce Tools Product" as the field type
4. Save your content definition

## Project Structure

```
.
├── app/
│   ├── fields/
│   │   └── commercetools-product/     # Main product field component
│   │       └── page.tsx
│   ├── modals/
│   │   └── select-commercetools-product/  # Product selection modal
│   │       └── page.tsx
│   └── app-details/                    # App information page
│       └── page.tsx
├── components/
│   ├── ProductListing.tsx              # Product browser with infinite scroll
│   ├── ProductRow.tsx                  # Individual product display
│   ├── EmptySection.tsx                # Empty state component
│   └── Loader.tsx                      # Loading indicator
├── hooks/
│   └── useProductDetails.ts            # Hook for fetching product details
├── lib/
│   ├── commercetools-client.ts         # CommerceTools API client setup
│   └── getProductListing.ts            # Product listing fetcher
├── types/
│   └── Product.ts                      # Product type definitions
└── public/
    └── .well-known/
        └── agility-app.json            # App configuration file
```

## Technical Architecture

### Agility Apps SDK Integration

This app uses the Agility Apps SDK v2 (`@agility/app-sdk`) and implements:

- **Custom Field Surface** ([page.tsx](app/fields/commercetools-product/page.tsx)): The main product selection interface that appears in content items
- **Modal Surface** ([page.tsx](app/modals/select-commercetools-product/page.tsx)): The product browser modal for selecting products

Key SDK hooks used:
- `useAgilityAppSDK`: Access app configuration and field values
- `useResizeHeight`: Auto-resize the field to fit content
- `contentItemMethods.setFieldValue`: Update field values
- `openModal` / `closeModal`: Show/hide the product selection modal

### CommerceTools Integration

The app uses the CommerceTools Platform SDK (`@commercetools/platform-sdk`) with:

- **Client Credentials Flow**: Secure authentication using OAuth2
- **Product Projection API**: Fetches product data with variants, images, and pricing
- **Product Projection Search API** (optional): Enables product search functionality

See [commercetools-client.ts](lib/commercetools-client.ts) for the client configuration.

### Data Flow

1. User clicks "Browse Products" in the custom field
2. Modal opens showing the product listing
3. Products are fetched from CommerceTools API with pagination
4. User can search/browse and select a product
5. Selected product data is serialized to JSON and stored in the field value
6. Product details are displayed in the custom field interface

## Configuration

### App Configuration File

The app is configured via [public/.well-known/agility-app.json](public/.well-known/agility-app.json):

```json
{
  "name": "Agility Commerce Tools App",
  "version": "1.0.0",
  "capabilities": {
    "fields": [
      {
        "name": "commercetools-product",
        "label": "Commerce Tools Product",
        "description": "A product from your Commerce Tools account."
      }
    ]
  },
  "configValues": [...]
}
```

## Development

### Build for Production

```bash
npm run build
npm start
```

### Dependencies

Key dependencies:
- `@agility/app-sdk`: ^2.0.4 - Agility Apps SDK
- `@agility/plenum-ui`: ^1.3.42 - Agility UI components
- `@commercetools/platform-sdk`: ^8.18.0 - CommerceTools SDK
- `@commercetools/ts-client`: ^4.3.0 - CommerceTools TypeScript client
- `next`: 13.4.2 - Next.js framework
- `react-infinite-scroll-component`: ^6.1.0 - Infinite scroll for product listings
- `swr`: ^2.1.5 - Data fetching and caching

## Troubleshooting

### Search Not Working

If product search is disabled:
1. Verify Product Projection Search is enabled in CommerceTools
2. Navigate to Merchant Center > Settings > Project settings > Storefront Search
3. Enable the feature and wait for indexing to complete

### Products Not Loading

1. Verify API credentials are correct
2. Check that the API client has `view_products` scope
3. Confirm the region matches your CommerceTools project region
4. Check browser console for error messages

### Invalid Product Data

The app stores product data as JSON in the field value. If you see errors:
1. Clear the field value and select a new product
2. Verify the product exists in CommerceTools
3. Check that the locale matches your product data

## CommerceTools Resources

### Documentation
- [CommerceTools API Reference](https://docs.commercetools.com/api/)
- [Product Projection Search](https://docs.commercetools.com/api/projects/products-search)

### Reference Code
- [Sunrise SPA](https://github.com/commercetools/sunrise-spa)

### Reference Data
- [Sunrise Data](https://github.com/commercetools/commercetools-sunrise-data)

### Marketplace
- [CommerceTools Marketplace](https://marketplace.commercetools.com/)

## License

This project is licensed under the terms specified by Agility CMS.