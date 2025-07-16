import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

export class ReferralFactory implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Referral Factory',
		name: 'ReferralFactory',
		icon: 'file:logo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Get data from Referral Factory API',
		defaults: {
			name: 'Referral Factory',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'ReferralFactoryApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://referral-factory.com/api/n8n',
		},

		properties: [
			{
				displayName: 'Action',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Add new user',
						value: 'create_user',
						action: 'Add new user',
						description: 'Add new user in Referral Factory',
						routing: {
							request: {
								method: 'POST',
								url: '/users',
								body: {
									campaign_id: '={{$parameter["campaign_id"]}}',
									first_name: '={{$parameter["first_name"]}}',
									email: '={{$parameter["email"]}}',
								},
							},
						},
					},
					{
						name: 'Qualify a user',
						value: 'qualify_user',
						action: 'Qualify a user',
						description: 'Qualify a user in Referral Factory',
						routing: {
							request: {
								method: 'POST',
								url: '/users/qualify',
								body: {
									campaign_id: '={{$parameter["campaign_id"]}}',
									email: '={{$parameter["email"]}}',
								},
							},
						},
					},
				],
				default: 'create_user',
			},
			{
				displayName: 'Choose your campaign',
				description: 'Select the campaign which was created in Referral Factory',
				name: 'campaign_id',
				type: 'options',
				required: true,
				default: 'Choose your campaign...',
				typeOptions: {
					loadOptionsMethod: 'getCampaigns',
				},
				displayOptions: {
					show: {
						operation: ['create_user'],
					},
				},
			},
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['create_user'],
					},
				},
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['create_user'],
					},
				},
			},
			{
				displayName: 'Qualify By ...',
				name: 'qualify_by',
				type: 'options',
				required: true,
				default: '',
				options: [
					{
						name: '... email address',
						value: 'by_email_address',
						action: 'Qualify user by email address',
						description: 'Qualify user by email address',
					},
					{
						name: '... referal code',
						value: 'by_referral_code',
						action: 'Qualify user by referral code',
						description: 'Qualify user by referral code',
					},
					{
						name: '... referral coupon',
						value: 'by_coupon',
						action: 'Qualify user by coupon',
						description: 'Qualify user by coupon',
					},
				],
				displayOptions: {
					show: {
						operation: ['qualify_user'],
					},
				},
			},
			{
				displayName: 'Campaign',
				name: 'campaign_id',
				type: 'options',
				required: true,
				default: '',
				typeOptions: {
					loadOptionsMethod: 'getCampaigns',
				},
				displayOptions: {
					show: {
						operation: ['qualify_user'],
						qualify_by: ['by_email_address'],
					},
				},
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['qualify_user'],
						qualify_by: ['by_email_address'],
					},
				},
			},
			{
				displayName: 'Referral Code',
				name: 'referral_code',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['qualify_user'],
						qualify_by: ['by_referral_code'],
					},
				},
			},
			{
				displayName: 'Coupon',
				name: 'coupon',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['qualify_user'],
						qualify_by: ['by_coupon'],
					},
				},
			},
		],
	};

	methods = {
		loadOptions: {
			async getCampaigns(this: ILoadOptionsFunctions) {
				const credentials = await this.getCredentials('ReferralFactoryApi');

				const response = await this.helpers.request({
					method: 'GET',
					url: `${credentials.baseUrl}/campaigns`,
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
				});

				const parsed = JSON.parse(response);

				return parsed.campaigns.map((campaign: { name: string; id: string }) => ({
					name: campaign.name,
					value: campaign.id,
				}));
			},
		},
	};
}
