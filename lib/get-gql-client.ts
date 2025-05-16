import { ApolloClient, InMemoryCache, ApolloProvider, gql, ApolloLink, HttpLink, from } from '@apollo/client';
import { onError } from "@apollo/client/link/error";

interface Props {
	storeUrl: string
	token: string
}

const cache = new InMemoryCache();


export const getGQLClient = ({ storeUrl, token }: Props) => {


	const errorLink = onError(({ graphQLErrors, networkError }) => {
		if (graphQLErrors)
			graphQLErrors.forEach(({ message, locations, path }) =>
				console.warn(
					`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
				)
			);
		if (networkError) console.warn(`[Network error]: ${networkError}`);
	});


	const httpLink = new HttpLink({ uri: `${storeUrl}/graphql` })


	const headerLink = new ApolloLink((operation, forward) => {
		// add the authorization to the headers
		operation.setContext(({ headers = {} }) => ({
			headers: {
				...headers,
				authorization: `Bearer ${token}`,
			}
		}));

		return forward(operation);
	})


	return new ApolloClient({
		cache,
		link: from([headerLink, errorLink, httpLink]),

	});

}