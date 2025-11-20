/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { Product } from "@/types/Product"
import { Checkbox } from "@agility/plenum-ui"
import { IconBan, IconCheck } from "@tabler/icons-react"
import classNames from "classnames"

interface Props {
	product: Product
	onSelectProduct: (product: Product) => void
}

export default function ProductRow({ product, onSelectProduct }: Props) {


	console.log("ProductRow render", product)

	//const imageListingUrl =

	return (
		<div className="flex flex-row items-center rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 p-4 gap-4 transition-all hover:shadow-md bg-white">
			<div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-50">
				<img
					src={product.image.detailUrl}
					className="h-16 w-16 object-cover"
					alt={product.name}
				/>
			</div>
			<div className="flex-1 min-w-0">
				<div className="text-base font-semibold text-gray-900 truncate mb-1">
					{product.name}
				</div>
				{product.sku && (
					<div className="text-sm text-gray-500 truncate" title={product.sku}>
						SKU: {product.sku}
					</div>
				)}
			</div>
			<div className="flex-shrink-0">
				<button
					type="button"
					className={classNames(
						"inline-flex items-center px-6 py-2.5 border border-transparent",
						"text-sm font-medium rounded-lg shadow-sm text-white",
						"bg-gray-500 hover:bg-gray-700",
						"focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
						"transition-colors duration-150"
					)}
					onClick={() => {
						onSelectProduct(product)
					}}
				>
					Select
				</button>
			</div>
		</div>
	)
}
