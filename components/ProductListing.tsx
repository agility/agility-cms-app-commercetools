/* eslint-disable @next/next/no-img-element */
import { getProductListing } from "@/lib/getProductListing"
import InfiniteScroll from 'react-infinite-scroll-component';
import { Button, TextInputAddon } from "@agility/plenum-ui"
import { useCallback, useEffect, useRef, useState } from "react"
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


	const scrollRef = useRef<HTMLDivElement>(null)

	const [hasMore, setHasMore] = useState<boolean>(true)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [offset, setOffset] = useState<number>(0)
	const [filter, setFilter] = useState("")
	const [filterValueBounced, setfilterValueBounced] = useState<string>("")

	const [error, setError] = useState<string | null>(null)
	const [products, setProducts] = useState<any[]>([])
	const [totalItems, setTotalItems] = useState<number>(0)
	const [searchEnabled, setSearchEnabled] = useState<boolean | null>(null)
	const [searchCheckMessage, setSearchCheckMessage] = useState<string>("")

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
			setfilterValueBounced(value)
		}, 250),
		[]
	)

	// Check if search endpoint is enabled
	useEffect(() => {
		const checkSearchEnabled = async () => {
			try {
				const params = new URLSearchParams({
					projectKey,
					clientId: clientID,
					clientSecret,
					region,
				})

				const res = await fetch(`/api/check-search-enabled?${params.toString()}`)
				const data = await res.json()

				if (res.ok) {
					setSearchEnabled(data.enabled)
					if (!data.enabled) {
						setSearchCheckMessage(data.instructions || "Search is not enabled for this project")
					}
				}
			} catch (err) {
				console.error("Error checking search status", err)
				// Default to disabled if we can't check
				setSearchEnabled(false)
			}
		}

		checkSearchEnabled()
	}, [projectKey, clientID, clientSecret, region])

	useEffect(() => {


		setIsLoading(true)
		setTotalItems(0)
		setError("")

		getProductListing({
			projectKey,
			clientId: clientID,
			clientSecret,
			region,
			locale,
			search: filterValueBounced,
			offset: 0
		}).then((data) => {

			setProducts(data.results)
			setTotalItems(data.total)
			setOffset(data.count)

			// Check if there are more products to load
			if (data.count === 0 || data.results.length >= data.total) {
				setHasMore(false)
			} else {
				setHasMore(true)
			}

		}).catch((err) => {
			console.error("Error fetching data", err)
			setError(err.message || "Error fetching data")
		}).finally(() => {
			setIsLoading(false)
		})


	}, [projectKey, clientID, clientSecret, region, locale, filterValueBounced])

	const fetchData = async () => {

		setError("")

		try {
			const res = await getProductListing({
				projectKey,
				clientId: clientID,
				clientSecret,
				region,
				locale,
				search: filterValueBounced,
				offset
			})

			//update the products, offset and total items
			setProducts((prev) => [...prev, ...res.results])
			setTotalItems(res.total)
			const newOffset = offset + res.count
			setOffset(newOffset)

			// Check if there are more products to load
			if (res.count === 0 || newOffset >= res.total) {
				setHasMore(false)
			}


		} catch (err: any) {
			console.error("Error fetching data", err)
			setError(err.message || "Error fetching data")
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
		<div className="flex flex-col h-full">
			<div className="flex flex-col gap-3 p-4 bg-gray-50 border-b border-gray-200">
				{searchEnabled && (
					<div className="w-full">
						<TextInputAddon
							placeholder="Search products..."
							type="search"
							value={filter}
							onChange={(str) => setfilterValueAndDebounce(str.trim())}
						/>
					</div>
				)}
				<div className="flex items-center justify-between gap-3 flex-wrap">
					<div className="text-gray-600 text-sm font-medium">
						{isLoading ? (
							<span className="flex items-center gap-2">
								<Loader className="!h-4 !w-4" />
								Loading products...
							</span>
						) : (
							<span>
								{totalItems ?? "?"} product{totalItems !== 1 ? 's' : ''} found
							</span>
						)}
					</div>
					{searchEnabled === false && searchCheckMessage && (
						<div className="relative group">
							<div className="flex gap-1.5 items-center cursor-help">
								<div className="text-sm font-medium text-blue-600">Search Not Enabled</div>
								<svg
									className="w-4 h-4 text-blue-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div className="absolute right-0 top-6 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
								<div className="font-semibold mb-1">Search Not Enabled</div>
								<div dangerouslySetInnerHTML={{ __html: searchCheckMessage }}></div>
							</div>
						</div>
					)}
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
			{error && (
				<div className="p-4 m-4 bg-red-50 border border-red-200 rounded-md">
					<div className="text-red-800 font-semibold mb-1">Error</div>
					<div className="text-red-700 text-sm">{error}</div>
				</div>
			)}
			{!isLoading && !error && products && (
				<div className="min-h-0 flex-1">
					<div id="scrollDiv" ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden">
						<div className="p-4">
							<InfiniteScroll
								dataLength={products.length}
								next={fetchData}
								hasMore={hasMore}
								scrollableTarget="scrollDiv"
								loader={
									<div className="flex justify-center py-4">
										<Loader className="!h-6 !w-6" />
									</div>
								}
								endMessage={
									<div className="text-center py-4 text-gray-400 text-sm">
										{products.length > 0 ? 'End of results' : ''}
									</div>
								}
							>
								<ul className="space-y-3">
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
								</ul>
							</InfiniteScroll>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
