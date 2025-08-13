import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	ILoadOptionsFunctions,
	IHookFunctions,
	IWebhookFunctions,
	IWebhookResponseData,
	IDataObject,
	IHttpRequestMethods,
} from 'n8n-workflow';

export class ReferralFactoryTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Referral Factory Trigger',
		name: 'referralFactoryTrigger',
		icon: 'file:logo.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{Trigger On: $parameter["event"]}}',
		description: 'Get data from Referral Factory API',
		defaults: {
			name: 'Referral Factory Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'referralFactoryApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Trigger On',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'When a New User Joins Your Campaign',
						value: 'user.join',
						description: 'Triggers when a new user joins or is added to your campaign',
					},
					{
						name: 'When a User Is Qualified',
						value: 'user.qualified',
						description: 'Triggers when a user is qualified in Referral Factory',
					},
					{
						name: 'When a Reward Issued via N8n',
						value: 'reward_issued',
						description: 'Triggers when a reward issued in Referral Factory via n8n',
					},
				],
				required: true,
				default: 'user.join',
			},
			{
				displayName: 'With Source Names or IDs',
				description: 'Choose user with which sources should be triggered. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				required: true,
				name: 'sources',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getUserSources',
				},
				displayOptions: {
					show: {
						event: ['user.join'],
					},
				},
				default: ['Referred'],
			},
			{
				displayName: 'Choose Your Campaign Name or ID',
				description: 'Select the campaign which was created in Referral Factory. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				name: 'campaign_id',
				type: 'options',
				required: true,
				default: '',
				displayOptions: {
					show: {
						event: ['user.join', 'user.qualified'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getCampaigns',
				},
			},
			{
				displayName: 'Choose Your Reward Name or ID',
				description: 'Select the reward which was created in Referral Factory. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				name: 'reward_id',
				type: 'options',
				required: true,
				default: '',
				displayOptions: {
					show: {
						event: ['reward_issued'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getRewards',
				},
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'referral-factory',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');

				return !!data.webhookId;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const credentials = await this.getCredentials('referralFactoryApi');
				const baseUrl = credentials.baseUrl;
				const apiKey = credentials.apiKey;

				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;
				let body = {};
				let url = `${baseUrl}/webhooks`;
				let method = 'POST';

				if (event === 'user.join') {
					body = {
						url: webhookUrl,
						event,
						sources: this.getNodeParameter('sources') as Array<string>,
						campaign_id: this.getNodeParameter('campaign_id') as string,
					};
				}

				if (event === 'user.qualified') {
					body = {
						url: webhookUrl,
						event,
						campaign_id: this.getNodeParameter('campaign_id') as string,
					};
				}

				if (event === 'reward_issued') {
					method = 'PUT';
					url = `${baseUrl}/rewards/${this.getNodeParameter('reward_id')}`;
					body = {
						url: webhookUrl,
						event,
						reward_id: this.getNodeParameter('reward_id') as string,
					};
				}

				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'referralFactoryApi',
				{
					method: method as IHttpRequestMethods,
					url: url,
					headers: {
						Authorization: `Bearer ${apiKey}`,
						Accept: 'application/json',
					},
					body: body,
					json: true,
				});

				this.getWorkflowStaticData('node').webhookId = response.webhook.id;

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const credentials = await this.getCredentials('referralFactoryApi');
				const baseUrl = credentials.baseUrl;

				const webhookId = this.getWorkflowStaticData('node').webhookId;

				if (!webhookId) return true;

				let url = `${baseUrl}/webhooks/${webhookId}`;

				if (this.getNodeParameter('event') === 'reward_issued') {
					url = `${baseUrl}/rewards/${this.getNodeParameter('reward_id')}`;
				}

				await this.helpers.requestWithAuthentication.call(
					this,
					'referralFactoryApi',
				{
					method: 'DELETE',
					url: url,
				});

				this.getWorkflowStaticData('node').webhookId = null;

				return true;
			},
		},
	};

	methods = {
		loadOptions: {
			async getUserSources(this: ILoadOptionsFunctions) {
				const credentials = await this.getCredentials('referralFactoryApi');

				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'referralFactoryApi',
				{
					method: 'GET',
					url: `${credentials.baseUrl}/user-sources`,
				});

				const parsed = JSON.parse(response);

				return parsed.sources.map((source: { name: string; id: string }) => ({
					name: source.name,
					value: source.id,
				}));
			},

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

			async getRewards(this: ILoadOptionsFunctions) {
				const credentials = await this.getCredentials('referralFactoryApi');

				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'referralFactoryApi',
				{
					method: 'GET',
					url: `${credentials.baseUrl}/rewards`,
				});

				const parsed = JSON.parse(response);

				return parsed.rewards.map((reward: { name: string; id: string }) => ({
					name: reward.name,
					value: reward.id,
				}));
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		// get the parsed JSON
		const body = this.getBodyData() as IDataObject;

		const workflowData = this.helpers.returnJsonArray([body]);

		return {
			workflowData: [workflowData],
		};
	}
}
