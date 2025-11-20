import useSWR from "swr"

interface Props {
	projectKey: string
	clientId: string
	clientSecret: string
	region: string
	search: string
	locale: string
	offset: number
}


export const getProductListing = async ({ projectKey, clientId, clientSecret, region, search, locale, offset }: Props) => {

	if (!projectKey || !clientId || !clientSecret || !region) return null

	const params = new URLSearchParams({
		projectKey,
		clientId,
		clientSecret,
		region,
		search,
		locale,
		offset: offset.toString()
	})

	const res = await fetch(`/api/get-products?${params.toString()}`, {
		method: "GET",
		headers: {
			'Accept': 'application/json',
		}
	})

	if (res.ok) {
		const data = await res.json()
		return data;
	}

	const errorData = await res.json().catch(() => ({}))
	const errorMessage = errorData.message || errorData.error || "Could not get Products"
	throw new Error(errorMessage)
}
