/* eslint-disable @next/next/no-img-element */
"use client"
import EmptySection from "@/components/EmptySection"
import useProductDetails from "@/hooks/useProductDetails"

import { Product } from "@/types/Product"
import { useAgilityAppSDK, contentItemMethods, openModal, useResizeHeight } from "@agility/app-sdk"
import { Button, ButtonDropDown } from "@agility/plenum-ui"
import { IconBan, IconBarcode, IconBuildingStore, IconCheck, IconChevronDown, IconFileBarcode } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"

export default function ProductField() {
	const { initializing, appInstallContext, field, fieldValue } = useAgilityAppSDK()

	const containerRef = useResizeHeight()

	const projectKey = appInstallContext?.configuration?.projectKey || ""
	const clientID = appInstallContext?.configuration?.clientID || ""
	const clientSecret = appInstallContext?.configuration?.clientSecret || ""
	const region = appInstallContext?.configuration?.region || ""
	const locale = appInstallContext?.configuration?.locale || ""

	const [selectedProduct, onsetSelectedProduct] = useState<Product | null | undefined>(null)

	//const { productDetail } = useProductDetails({ store, token: access_token, entityID: selectedProduct?.entityId })
	const productDetail = null

	const setSelectedProduct = (product: Product | null | undefined) => {
		const productJSON = product ? JSON.stringify(product) : ""
		contentItemMethods.setFieldValue({ name: field?.name, value: productJSON })
		onsetSelectedProduct(product)
	}

	const selectProduct = () => {
		openModal<Product | null>({
			title: "Select a Product",
			name: "select-commercetools-product",
			props: {
				selectedProductID: 1,
			},
			callback: (product: Product | null | undefined) => {
				if (product) setSelectedProduct(product)
			},
		})
	}

	useEffect(() => {
		//initialize the field value of the product
		if (!fieldValue) {
			onsetSelectedProduct(null)
			return
		}

		let product: Product | null = null

		try {
			product = JSON.parse(fieldValue)
		} catch (e) {
			console.log("Error parsing product JSON.", e)
		}

		onsetSelectedProduct(product)
	}, [fieldValue])

	useEffect(() => {
		//load the product details if we have a product
		if (!selectedProduct) return
	}, [selectedProduct])

	if (initializing) return null

	return (
		<div ref={containerRef} id="product-field" className="bg-white">
			<div className="p-[1px]">
				{selectedProduct && (
					<div className="flex border border-gray-200 rounded gap-2">
						<div className="rounded-l shrink-0">
							<img src={selectedProduct.image?.detailUrl} className="h-60 rounded-l" alt={selectedProduct.name} />
						</div>
						<div className="flex-1 flex-col p-2 ">
							<div className="flex gap-2">
								<div>
									<div className="text-xl font-medium">{selectedProduct.name}</div>
									<div className=" text-gray-500 line-clamp-2 break-words">{selectedProduct.description}</div>
								</div>
								<div className="flex justify-end p-1 mb-2">
									<div>
										<ButtonDropDown
											button={{
												type: "secondary",
												size: "base",
												label: "Browse",
												icon: "CollectionIcon",
												onClick: () => selectProduct(),
											}}
											dropDown={{
												items: [
													[
														{
															label: "Remove Product",
															icon: "TrashIcon",
															onClick: () => {
																setSelectedProduct(null)
															},
														},
													],
												],
												IconElement: () => <IconChevronDown />,
											}}
										/>
									</div>
								</div>
							</div>

							<div className=" flex justify-between py-2 mt-5 border-b border-b-gray-200 ">
								<div className="text-gray-500">SKU</div>
								<div className="">{selectedProduct.sku}</div>
							</div>

							{productDetail && (
								<>
									{/* <div className=" flex justify-between py-2 border-b border-b-gray-200">
										<div className="text-gray-500">Stock</div>
										<div className="flex gap-1 items-center">
											{productDetail?.inventory?.isInStock ? (
												<div title="In stock">
													<IconCheck className="h-5 w-5 text-green-500" />
												</div>
											) : (
												<div title="Out of stock">
													<IconBan className="h-5 w-5 text-red-500" />
												</div>
											)}
											{productDetail.availabilityV2?.status}
										</div>
									</div>
									{productDetail?.prices?.price?.value && (
										<div className=" flex justify-between py-2 border-b border-b-gray-200 ">
											<div className="text-gray-500">Price</div>
											<div className="">
												${productDetail.prices.price.value} {productDetail.prices.price.currencyCode}
											</div>
										</div>
									)} */}
								</>
							)}
						</div>
					</div>
				)}

				{!selectedProduct && (
					<EmptySection
						icon={<IconBuildingStore className="text-gray-400 h-12 w-12" stroke={1} />}
						messageHeading="No Product Selected"
						messageBody="Select a product to attach it to this item."
						buttonComponent={<Button type="alternative" onClick={() => selectProduct()} label="Browse Products" />}
					/>
				)}
			</div>
		</div>
	)
}
