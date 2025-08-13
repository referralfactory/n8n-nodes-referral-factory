import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

export class ReferralFactory implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Referral Factory',
		name: 'referralFactory',
		icon: 'file:logo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{Action: $parameter["operation"]}}',
		description: 'Get data from Referral Factory API',
		defaults: {
			name: 'Referral Factory',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'referralFactoryApi',
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
						name: 'Add New User',
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
						name: 'Qualify a User',
						value: 'qualify_user',
						action: 'Qualify a user',
						description: 'Qualify a user in Referral Factory',
					},
				],
				default: 'create_user',
			},
			{
				displayName: 'Choose Your Campaign Name or ID',
				description: 'Select the campaign which was created in Referral Factory. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				name: 'campaign_id',
				type: 'options',
				required: true,
				default: '',
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
				placeholder: 'name@email.com',
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
				default: 'by_email_address',
				options: [
					{
						name: '... Email Address',
						value: 'by_email_address',
						action: 'Qualify user by email address',
						description: 'Qualify user by email address',
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
					{
						name: '... Referal Code',
						value: 'by_referral_code',
						action: 'Qualify user by referral code',
						description: 'Qualify user by referral code',
						routing: {
							request: {
								method: 'POST',
								url: '/users/qualify',
								body: {
									code: '={{$parameter["code"]}}',
								},
							},
						},
					},
					{
						name: '... Referral Coupon',
						value: 'by_coupon',
						action: 'Qualify user by coupon',
						description: 'Qualify user by coupon',
						routing: {
							request: {
								method: 'POST',
								url: '/users/qualify',
								body: {
									coupon: '={{$parameter["coupon"]}}',
								},
							},
						},
					},
				],
				displayOptions: {
					show: {
						operation: ['qualify_user'],
					},
				},
			},
			{
				displayName: 'Campaign Name or ID',
				name: 'campaign_id',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
				placeholder: 'name@email.com',
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
				name: 'code',
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
				const credentials = await this.getCredentials('referralFactoryApi');

				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'referralFactoryApi',
				{
					method: 'GET',
					url: `${credentials.baseUrl}/campaigns`,
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
