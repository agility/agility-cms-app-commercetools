/* eslint-disable @next/next/no-img-element */
"use client"
import EmptySection from "@/components/EmptySection"
import useProductDetails from "@/hooks/useProductDetails"

import { Product } from "@/types/Product"
import { useAgilityAppSDK, contentItemMethods, openModal, useResizeHeight } from "@agility/app-sdk"
import { Button, ButtonDropDown } from "@agility/plenum-ui"
import { IconBan, IconBarcode, IconChevronDown, IconExternalLink } from "@tabler/icons-react"
import { useEffect, useState } from "react"

export default function ProductField() {
	const { initializing, appInstallContext, field, fieldValue } = useAgilityAppSDK()

	const containerRef = useResizeHeight()

	const projectKey = appInstallContext?.configuration?.projectKey || ""
	const clientID = appInstallContext?.configuration?.clientID || ""
	const clientSecret = appInstallContext?.configuration?.clientSecret || ""
	const region = appInstallContext?.configuration?.region || ""
	const locale = appInstallContext?.configuration?.locale || ""

	const [selectedProduct, onsetSelectedProduct] = useState<Product | null | undefined>(null)

	const { productDetail } = useProductDetails({
		projectKey,
		clientId: clientID,
		clientSecret,
		region,
		locale,
		productId: selectedProduct?.id
	})

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
		<div ref={containerRef} id="product-field" className="">
			<div className="p-[1px]">
				{selectedProduct && (
					<div className="">
						{/* Header with Browse button */}
						<div className="flex items-center justify-between px-4 pb-3 ">
							<h3 className="text-sm font-medium text-gray-700">A product has been selected.</h3>
							<ButtonDropDown
								button={{
									type: "alternative",
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

						{/* Product Content */}
						<div className="rounded border border-gray-300 bg-white flex gap-4 p-4">
							{/* Product Image */}
							<div className="shrink-0">
								<img
									src={selectedProduct.image?.detailUrl}
									className="h-48 w-48 object-cover rounded border border-gray-200"
									alt={selectedProduct.name}
								/>
							</div>

							{/* Product Details */}
							<div className="flex-1 min-w-0">
								{/* Product Name */}
								<h2 className="text-2xl font-semibold text-gray-900 mb-2">
									{selectedProduct.name}
								</h2>

								{/* Product Description */}
								{productDetail?.description && (
									<p className="text-sm text-gray-600 mb-4 line-clamp-2">
										{productDetail.description}
									</p>
								)}

								{/* Product Info Grid */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4">
									<div>
										<div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
											SKU
										</div>
										<div className="text-sm font-medium text-gray-900 flex items-center gap-2">
											<IconBarcode className="h-4 w-4 text-gray-400" />
											<a
												href={`https://mc.${region}.commercetools.com/${projectKey}/products/${selectedProduct.id}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-gray-900 underline hover:text-gray-700 flex items-center gap-1"
											>
												{selectedProduct.sku}
												<IconExternalLink className="h-3.5 w-3.5" />
											</a>
										</div>
									</div>

									{productDetail?.masterVariant?.price && (
										<div>
											<div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
												Price
											</div>
											<div className="text-sm font-medium text-gray-900">
												{(productDetail.masterVariant.price.value / 100).toFixed(2)} {productDetail.masterVariant.price.currencyCode}
											</div>
										</div>
									)}

									{productDetail?.masterVariant?.images && productDetail.masterVariant.images.length > 1 && (
										<div>
											<div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
												Images
											</div>
											<div className="text-sm text-gray-900">
												{productDetail.masterVariant.images.length} image{productDetail.masterVariant.images.length !== 1 ? 's' : ''}
											</div>
										</div>
									)}

									{productDetail?.variants && productDetail.variants.length > 0 && (
										<div>
											<div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
												Variants
											</div>
											<div className="text-sm text-gray-900">
												{productDetail.variants.length} variant{productDetail.variants.length !== 1 ? 's' : ''}
											</div>
										</div>
									)}

									{productDetail?.categories && productDetail.categories.length > 0 && (
										<div className="sm:col-span-2">
											<div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
												Categories
											</div>
											<div className="flex flex-wrap gap-2">
												{productDetail.categories.map((category: any) => (
													<span
														key={category.id}
														className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
													>
														{category.name}
													</span>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{!selectedProduct && (
					<EmptySection
						icon={<img src="/commercetools-symbol.svg" className="h-16 w-16 opacity-40" alt="CommerceTools" />}
						messageHeading="No Product Selected"
						messageBody="Select a product to attach it to this item."
						buttonComponent={<Button type="alternative" onClick={() => selectProduct()} label="Browse Products" />}
					/>
				)}
			</div>
		</div>
	)
}
