/* eslint-disable @next/next/no-img-element */
import useGraphQLToken from "@/hooks/useGraphQLToken"
import useProductListing, { getProductListing } from "@/hooks/useProductListing"
import InfiniteScroll from 'react-infinite-scroll-component';
import { Button, TextInputAddon } from "@agility/plenum-ui"
import { useCallback, useEffect, useState } from "react"
import { debounce } from "underscore"
import Loader from "./Loader"
import ProductRow from "./ProductRow"
import { Product } from "@/types/Product"

interface Props {
	clientID: string
	clientSecret: string
	region: string
	projectKey: string
	locale: string
	onSelectProduct: (product: Product) => void
}

export default function ProductListing({ clientID, clientSecret, region, projectKey, locale, onSelectProduct }: Props) {
	const { gqlToken } = useGraphQLToken({ clientID, clientSecret, region, projectKey })

	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [offset, setOffset] = useState<number>(0)
	const [filter, setFilter] = useState("")
	const [filterValueBounced, setfilterValueBounced] = useState<string>("")

	const [error, setError] = useState<string | null>(null)
	const [products, setProducts] = useState<any[]>([])
	const [totalItems, setTotalItems] = useState<number>(0)

	const setfilterValueAndDebounce = (val: string) => {
		setFilter(val)
		debouncefilterValue(val)
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncefilterValue = useCallback(
		//handle the search change - use debounce to limit how many times per second this is called
		debounce((value: string) => {
			//clear out the pagination cursor
			setOffset(0)

			//set the filter
			setfilterValueBounced(value.toLowerCase())
		}, 250),
		[]
	)

	const storeUrl = `https://api.${region}.commercetools.com/${projectKey}`

	useEffect(() => {
		if (!gqlToken) {
			return
		}

		setIsLoading(true)
		setTotalItems(0)
		setError("")

		getProductListing({
			storeUrl,
			locale,
			token: gqlToken.access_token,
			search: filterValueBounced,
			offset: 0
		}).then((data) => {
			console.log("initial data", data)

			setProducts(data.results)
			setTotalItems(data.total)
			setOffset(data.count)

		}).catch((err) => {
			console.error("Error fetching data", err)
			setError("Error fetching data")
		}).finally(() => {
			setIsLoading(false)
		})


	}, [gqlToken, storeUrl, filterValueBounced])

	const fetchData = async () => {
		if (!gqlToken) {
			return
		}
		setError("")

		try {
			const res = await getProductListing({
				locale,
				storeUrl,
				token: gqlToken.access_token,
				search: filterValueBounced,
				offset
			})

			console.log("fetchData", res)

			//update the products, offset and total items
			setProducts((prev) => [...prev, ...res.results])
			setTotalItems(res.total)
			setOffset((prev) => prev + res.count)


		} catch (err) {
			console.error("Error fetching data", err)
			setError("Error fetching data")
		} finally {
			setIsLoading(false)
		}


	}

	// const { isLoading, error, products } = useProductListing({
	// 	storeUrl,
	// 	token: gqlToken,
	// 	search: filterValueBounced,
	// 	offset
	// })


	return (
		<div className=" flex flex-col h-full">
			<div className="flex items-center gap-2">
				<div className="p-1 flex-1">
					<TextInputAddon
						placeholder="Search"
						type="search"
						value={filter}
						onChange={(str) => setfilterValueAndDebounce(str.trim())}
					/>
				</div>
				<div className="text-gray-500 text-sm">
					{totalItems ?? "?"} product(s) returned
				</div>
			</div>
			{isLoading && (
				<div className="flex flex-col flex-1 h-full justify-center items-center min-h-0">
					<div className="flex gap-2 items-center text-gray-500">
						<Loader className="!h-6 !w-6 " />
						<div>Loading...</div>
					</div>
				</div>
			)}
			{error && <div>Error? {`${error}`}</div>}
			{!isLoading && !error && products && (
				<div className="min-h-0 flex-1 py-4">
					<div className="scroll-black h-full overflow-y-auto">
						<ul className="space-y-2 p-2 ">


							<InfiniteScroll
								dataLength={products.length} //This is important field to render the next data
								next={fetchData}
								hasMore={true}
								loader={<div><Loader className="!h-6 !w-6 " /></div>}
								endMessage={
									<div> - </div>
								}
							// below props only if you need pull down functionality
							>

								{products?.map((product: any) => (
									<li key={product.id}>
										<ProductRow

											product={{
												id: product.id,
												path: product.slug,
												sku: product.allVariants[0].sku,
												entityId: product.id,
												image: {
													listingUrl: product.allVariants[0].images[0].url || "",
													detailUrl: product.allVariants[0].images[0].url || "",
												},
												name: product.name,
												description: "",
											}}
											onSelectProduct={onSelectProduct}
										/>
									</li>
								))}
							</InfiniteScroll>
						</ul>
					</div>
				</div>
			)}
		</div>
	)
}
