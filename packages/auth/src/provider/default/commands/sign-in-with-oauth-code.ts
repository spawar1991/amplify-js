import { CommandFactory } from '../context';
import { Command } from '../..';
import {
	GetIdCommand,
	GetCredentialsForIdentityCommand,
} from '@aws-sdk/client-cognito-identity';

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

		const getIdCommand = new GetIdCommand({
			IdentityPoolId: context.config.identityPoolId,
			Logins,
		});
		try {
			const getIdResponse = await context.clients.identityPool.send(
				getIdCommand
			);

			if (!getIdResponse.IdentityId) {
				throw new Error();
			}

			const getCredentialsCommand = new GetCredentialsForIdentityCommand({
				IdentityId: getIdResponse.IdentityId,
				Logins,
			});

			const getCredentialsResponse = await context.clients.identityPool.send(
				getCredentialsCommand
			);

			if (!getCredentialsResponse.Credentials) {
				throw new Error();
			}

			context.clients.identityPool.config.credentials = () =>
				Promise.resolve({
					accessKeyId: getCredentialsResponse.Credentials.AccessKeyId,
					secretAccessKey: getCredentialsResponse.Credentials.SecretKey,
					sessionToken: getCredentialsResponse.Credentials.SessionToken,
					expiration: getCredentialsResponse.Credentials.Expiration,
				});
		} catch (e) {
			throw e;
		}
	} catch (e) {
		throw e;
	}
};
