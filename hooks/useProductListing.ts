import useSWR from "swr"

interface Props {
	storeUrl: string
	token: string
	search: string
	locale: string
	offset: number
}


export const getProductListing = async ({ storeUrl, token, search, locale, offset }: Props) => {

	console.log("getProductListing", { storeUrl, token, search, locale, offset })

	if (!storeUrl || !token) return null

	const res = await fetch(`/api/get-products?storeUrl=${encodeURIComponent(storeUrl)}&search=${encodeURIComponent(search)}&locale=${encodeURIComponent(locale)}&offset=${encodeURIComponent(offset)}`, {
		method: "GET",
		headers: {
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + token,
		}
	})

	if (res.ok) {
		const data = await res.json()

		return data;
	}

	throw new Error("Could not get Products")
}

export default function useProductListing({ storeUrl, token, search, offset, locale }: Props) {

	const { data, error, isLoading } = useSWR(`/api/get-products-${token}-${storeUrl}-${search}-${offset}`, async () => {

		return await getProductListing({ storeUrl, token, search, locale, offset })

	})

	return {
		products: data,
		isLoading,
		error
	}

}