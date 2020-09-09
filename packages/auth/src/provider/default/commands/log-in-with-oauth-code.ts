import { CommandFactory } from './command-factory';
import { Command } from '../..';
import {
	GetIdCommand,
	GetCredentialsForIdentityCommand,
} from '@aws-sdk/client-cognito-identity';

export const createLogInWithOAuthCode: CommandFactory<Command<
	string,
	void // for now
>> = context => async (code: string): Promise<void> => {
	const clientId = '';
	const redirectUri = '';
	const codeVerifier = '';

	try {
		const hostedUiResponse = (await fetch(
			`https://${context.config.oauth.domain}/oauth2/token`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: `grant_type=authorization_code&code=${code}&client_id=${clientId}&redirect_uri=${redirectUri}${
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
			const getIdResponse = await context.identityPoolClient.send(getIdCommand);

			if (!getIdResponse.IdentityId) {
				throw new Error();
			}

			const getCredentialsCommand = new GetCredentialsForIdentityCommand({
				IdentityId: getIdResponse.IdentityId,
				Logins,
			});

			const getCredentialsResponse = await context.identityPoolClient.send(
				getCredentialsCommand
			);

			console.log(getCredentialsResponse);
		} catch (e) {
			throw e;
		}
	} catch (e) {
		throw e;
	}
	// 1. get access token
	// 2. get identity id
	// 3. get credentials
	// 4. override context.identityPoolClient with new client that has credentials retrieved from step 3
	// what do we do with the credentials for the user pool client
};
