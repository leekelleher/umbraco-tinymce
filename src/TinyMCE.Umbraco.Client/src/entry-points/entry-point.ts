import { client } from '../api/client.gen.js';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import type { UmbEntryPointOnInit, UmbEntryPointOnUnload } from '@umbraco-cms/backoffice/extension-api';

export const onInit: UmbEntryPointOnInit = (_host, _extensionRegistry) => {
	// Will use only to add in Open API config with generated TS OpenAPI HTTPS Client
	// Do the OAuth token handshake stuff
	_host.consumeContext(UMB_AUTH_CONTEXT, async (authContext) => {
		if (!authContext) return;

		// Get the token info from Umbraco
		const config = authContext.getOpenApiConfiguration();

		client.setConfig({
			baseUrl: config.base,
			credentials: config.credentials,
		});

		// For every request being made, add the token to the headers
		// Can't use the setConfig approach above as its set only once and
		// tokens expire and get refreshed
		client.interceptors.request.use(async (request, _options) => {
			const token = await config.token();
			request.headers.set('Authorization', `Bearer ${token}`);
			return request;
		});
	});
};

export const onUnload: UmbEntryPointOnUnload = (_host, _extensionRegistry) => {};
