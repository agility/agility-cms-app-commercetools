/* eslint-disable @next/next/no-img-element */
"use client"

import ProductListing from "@/components/ProductListing"
import { useAgilityAppSDK, closeModal } from "@agility/app-sdk"
import { Button } from "@agility/plenum-ui"

export default function SelectProduct() {
	const { initializing, appInstallContext } = useAgilityAppSDK()

	const projectKey = appInstallContext?.configuration?.projectKey || ""
	const clientID = appInstallContext?.configuration?.clientID || ""
	const clientSecret = appInstallContext?.configuration?.clientSecret || ""
	const region = appInstallContext?.configuration?.region || ""
	const locale = appInstallContext?.configuration?.locale || ""


	if (initializing) {
		return null
	}

	//TODO: pull the store and access_token from the appInstallContext
	return (
		<div className="h-full flex flex-col">
			<div className="flex-1 min-h-0">
				<ProductListing
					{...{ clientID, clientSecret, region, projectKey, locale }}
					onSelectProduct={(product) => {
						closeModal(product)
					}}
				/>
			</div>
			<div className="flex justify-end p-1">
				<Button
					type="alternative"
					label="Cancel"
					className="w-24"
					onClick={() => {
						closeModal(null)
					}}
				/>
			</div>
		</div>
	)
}
