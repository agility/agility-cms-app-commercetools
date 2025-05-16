import useSWR from "swr"

interface Props {
	store: string
	token: string
}


export default function useStoreInfo({ store, token }: Props) {

	const { data, error, isLoading } = useSWR(`/api/get-store-${token}-${store}`, async () => {
		if (! store || ! token) return null
		const res = await fetch(`/api/get-store?store=${encodeURIComponent(store)}`, {
			method: "GET",
			headers: {
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + token,
			}
		})

		if (res.ok) {
			const data = await res.json()
			return data
		}
		throw new Error("Could not get Store Info")

	}, {
		revalidateOnFocus: false,
	})

	return {
		storeInfo: data,
		isLoading,
		error
	}

}