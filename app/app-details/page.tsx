'use client'
import { Button } from "@agility/plenum-ui";

export default function AppDetails() {

	return (
		<div className="bg-white">
			<div className="max-w-lg bg-gray-50 rounded shadow m-auto p-5 mt-10 space-y-3">
				<h2 className="text-xl font-medium">Agility commercetools Connector</h2>
				<p className="">Please edit the configuration of your commercetools App in the Agility content manager.</p>
				<div className="">
					<Button
						label="Launch Agility"
						asLink={{
							href: "https://app.agilitycms.com/settings/apps",
							target: "_blank",
							title: "Launch Agility"
						}} />

				</div>
			</div>
		</div>
	)

}