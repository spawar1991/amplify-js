import { Command } from '../..';
import { CommandFactory } from './helpers';

export const createSignInWithOAuthCode: CommandFactory<Command<
	string,
	void
>> = context => async (code: string): Promise<void> => {
	const codeVerifier = '';

	try {
		const hostedUiResponse = (await fetch(
			`https://${context.config.oauth.domain}/oauth2/token`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: `grant_type=authorization_code&code=${code}&client_id=${
					context.config.userPoolWebClientId
					// @ts-ignore – TODO: add the following field
				}&redirect_uri=${context.config.oauth.redirectSignIn}${
					codeVerifier ? `code_verifier=${codeVerifier}` : ''
				}`,
			}
		).then(r => r.json())) as {
			access_token: string;
			refresh_token: string;
			id_token: string;
			error?: string;
		};

		if (hostedUiResponse.error) {
			throw new Error();
		}

		const domain = `cognito-idp.${context.config.region}.amazonaws.com/${context.config.userPoolId}`;
		const Logins = { [domain]: hostedUiResponse.access_token };

		const credentials = await context.getCredentialsOrThrowError({
			accessTokenRec: Logins,
		});

		context.getIdentityPoolClientOrThrowError().config.credentials = () => {
			return Promise.resolve({
				accessKeyId: credentials.AccessKeyId,
				secretAccessKey: credentials.SecretKey,
				sessionToken: credentials.SessionToken,
				expiration: credentials.Expiration,
			});
		};
	} catch (e) {
		throw e;
	}
};
