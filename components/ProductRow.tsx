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
	return (
		<div className="flex flex-row items-center rounded shadow border border-gray-100 p-2 gap-3">
			<div className="flex-shrink-0 h-10 w-10 rounded">
				<img src={product.image.listingUrl} className="h-10 w-10 rounded" />
			</div>
			<div className="flex-1">
				<div className="text-sm font-medium text-gray-900">{product.name}</div>
				<div className="text-sm text-gray-500 line-clamp-3">{product.description}</div>
			</div>
			{product.sku && (
				<div className="text-sm text-gray-500 flex-nowrap line-clamp-1 w-32 break-all" title={product.sku}>
					SKU: {product.sku}
				</div>
			)}
			{/* <div className="text-sm text-gray-500 flex-nowrap line-clamp-1 w-24 break-all flex gap-1">
				{node?.inventory?.isInStock ? (
					<div title="In stock">
						<IconCheck className="h-5 w-5 text-green-500" />
					</div>
				) : (
					<div title="Out of stock">
						<IconBan className="h-5 w-5 text-red-500" />
					</div>
				)}

				<div>{node?.availabilityV2?.status} </div>
			</div> */}

			{/* {node?.prices?.price?.value && (
				<div className="text-sm text-gray-500 flex-nowrap line-clamp-1 w-32 break-all">
					${node.prices.price.value} {node.prices.price.currencyCode}
				</div>
			)} */}

			<div className="">
				<button
					type="button"
					className={classNames("inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500")}
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
