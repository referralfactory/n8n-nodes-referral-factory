import { ReferralFactoryApi } from '../../credentials/ReferralFactoryApi.credentials';

describe('ReferralFactoryApi Credential', () => {
	it('should be instantiated correctly', () => {
		const cred = new ReferralFactoryApi();
		expect(cred).toBeDefined();
		expect(typeof cred.name).toBe('string');
	});
});