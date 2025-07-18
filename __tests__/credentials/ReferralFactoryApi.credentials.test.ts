import { ReferralFactoryApi } from '../../credentials/ReferralFactoryApi.credentials';

describe('ReferralFactoryApi Credential', () => {
	it('should be instantiated properly', () => {
		const credential = new ReferralFactoryApi();

		expect(credential.name).toBe('referralFactoryApi');
		expect(credential.displayName).toBe('Referral Factory API');
		expect(Array.isArray(credential.properties)).toBe(true);
		expect(credential.properties.length).toBeGreaterThan(0);
	});
});