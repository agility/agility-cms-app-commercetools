import {
  ClientBuilder,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
} from '@commercetools/ts-client';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';

interface BuildClientOptions {
  projectKey: string;
  clientId: string;
  clientSecret: string;
  region: string;
  scopes?: string[];
}

export function createCommercetoolsClient({
  projectKey,
  clientId,
  clientSecret,
  region,
  scopes = [`view_products:${projectKey}`],
}: BuildClientOptions) {
  const authMiddlewareOptions: AuthMiddlewareOptions = {
    host: `https://auth.${region}.commercetools.com`,
    projectKey,
    credentials: {
      clientId,
      clientSecret,
    },
    scopes,
    httpClient: fetch,
  };

  const httpMiddlewareOptions: HttpMiddlewareOptions = {
    host: `https://api.${region}.commercetools.com`,
    httpClient: fetch,
  };

  const ctpClient = new ClientBuilder()
    .withProjectKey(projectKey)
    .withClientCredentialsFlow(authMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOptions)
    .build();

  return createApiBuilderFromCtpClient(ctpClient).withProjectKey({ projectKey });
}
