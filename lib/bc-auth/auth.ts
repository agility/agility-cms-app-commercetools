const { AUTH_CALLBACK, BIGCOMMERCE_CLIENT_ID, BIGCOMMERCE_CLIENT_SECRET } = process.env;

import { QueryParams } from '@/types/QueryParams';
import * as BigCommerce from 'node-bigcommerce';

export function getBigCommerceClient() {

	// Create BigCommerce instance
	// https://github.com/bigcommerce/node-bigcommerce/
	const bigcommerce = new BigCommerce({
		logLevel: 'info',
		clientId: BIGCOMMERCE_CLIENT_ID,
		secret: BIGCOMMERCE_CLIENT_SECRET,
		callback: AUTH_CALLBACK,
		responseType: 'json',
		headers: { 'Accept-Encoding': '*' },
		apiVersion: 'v3'
	});

	return bigcommerce
}
