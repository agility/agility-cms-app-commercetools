import useSWR from "swr"

interface Props {
	projectKey: string
	clientID: string
	clientSecret: string
	region: string
}

const getGraphQLToken = async ({ clientID, clientSecret, region, projectKey }: Props) => {
	if (!clientID || !clientSecret || !region || !projectKey) return null

	const scope = `view_products:${projectKey}`
	const url = `https://auth.${region}.commercetools.com/oauth/token?grant_type=client_credentials&scope=${scope}`

	const basicAuth = Buffer.from(`${clientID}:${clientSecret}`).toString('base64')

	const res = await fetch(url, {
		method: "POST",
		headers: {
			'Accept': 'application/json',
			'Authorization': `Basic ${basicAuth}`
		}
	})

	if (res.ok) {
		const data = await res.json()
		return data
	}
	throw new Error("Could not get GraphQL Token")
}

export default function useGraphQLToken({ clientID, clientSecret, region, projectKey }: Props) {

	const { data, error, isLoading } = useSWR(`/api/get-gql-token-${clientID}-${clientSecret}-${region}-${projectKey}`,
		() => getGraphQLToken({ clientID, clientSecret, region, projectKey }),
		{
			revalidateOnFocus: false,
		})

	return {
		gqlToken: data,
		isLoading,
		error
	}

}