import useSWR from "swr"

interface Props {
	projectKey: string
	clientId: string
	clientSecret: string
	region: string
	locale?: string
	productId?: string
}

export default function useProductDetails({
	projectKey,
	clientId,
	clientSecret,
	region,
	locale = 'en-US',
	productId
}: Props) {

	const { data, error, isLoading } = useSWR(
		productId ? `/api/get-product-${projectKey}-${productId}` : null,
		async () => {
			if (!productId) return null

			const params = new URLSearchParams({
				projectKey,
				clientId,
				clientSecret,
				region,
				locale,
				productId
			})

			const res = await fetch(`/api/get-product?${params.toString()}`, {
				method: "GET",
				headers: {
					'Accept': 'application/json',
				}
			})

			if (res.ok) {
				const data = await res.json()
				return data
			}

			throw new Error(`Could not get product for ID ${productId}`)
		}
	)

	return {
		productDetail: data,
		isLoading,
		error
	}
}
