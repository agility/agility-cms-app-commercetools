# Commercetool App for Agility CMS

## Notes:
This app uses the GraphQL API to query your product data.

- You must create an API Client in you developer settings that allows read-only access to your product data.

- This app uses the Product Projection Search API.  You must turn on this feature via the Merchant Center by navigating to Settings > Project settings > Storefront Search


### Docs from Commerce Tools:

Reference Code
- https://github.com/commercetools/sunrise-spa

Reference Data
- https://github.com/commercetools/commercetools-sunrise-data

Marktetplace
- https://marketplace.commercetools.com/



### Sample GraphQL Query For Products/Variants

```
{
  productProjectionSearch(staged: true, locale: "en-US", text: "", offset: 0, limit:25) {
    total
    count
    results {
      id
      name(locale: "en-US")
      slug(locale: "en-US")
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
        name(locale: "en-US")
      }
      productType {
        name
      }
    }
  }
}
```