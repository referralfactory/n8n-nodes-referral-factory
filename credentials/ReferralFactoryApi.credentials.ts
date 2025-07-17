import { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class ReferralFactoryApi implements ICredentialType {
	name = 'referralFactoryApi';
	displayName = 'Referral Factory API';
	// Uses the link to this tutorial as an example
	// Replace with your own docs links when building your own nodes
	documentationUrl = 'https://referral-factory.com/settings/webhooks-and-api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Access Token',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'hidden',
			default: 'https://referral-factory.com/api/n8n',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: '={{ "Bearer " + $credentials.apiKey }}',
			},
		},
	};
}
