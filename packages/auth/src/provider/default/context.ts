import {
	CognitoIdentityProviderClient,
	AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import {
	CognitoIdentityClient,
	Credentials,
	GetIdCommand,
	GetCredentialsForIdentityCommand,
} from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { Config } from '..';

export interface GetCredentialsOrThrowErrorOptions {
	identityId?: string;
	accessTokenRec?: Record<string, string>;
}

export class Context {
	authFlowType: AuthFlowType = AuthFlowType.USER_SRP_AUTH;
	identityPoolClient?: CognitoIdentityClient;
	userPoolClient: CognitoIdentityProviderClient;

	constructor(public config: Config) {
		/**
		 * @see https://github.com/aws/aws-sdk-js-v3/issues/185
		 */
		const credentials = () => Promise.resolve({} as any);

		this.userPoolClient = new CognitoIdentityProviderClient({
			region: config.region,
			credentials,
		});

		if (this.config.oauth) {
			const identityPoolClient = new CognitoIdentityClient({
				region: this.config.region,
				credentials,
			});

			if (!this.config.mandatorySignIn) {
				identityPoolClient.config.credentials = fromCognitoIdentityPool({
					identityPoolId: this.config.identityPoolId,
					client: identityPoolClient,
				});
			}

			this.identityPoolClient;
		}
	}

	getIdentityPoolClientOrThrowError = (): CognitoIdentityClient => {
		if (!this.identityPoolClient) {
			throw new Error();
		}

		return this.identityPoolClient;
	};

	getIdentityIdOrThrowError = async (
		accessTokenRec?: Record<string, string>
	): Promise<string> => {
		const command = new GetIdCommand({
			IdentityPoolId: this.config.identityPoolId,
			Logins: accessTokenRec,
		});

		try {
			const response = await this.identityPoolClient.send(command);
			if (!response.IdentityId) {
				throw new Error();
			}
			return response.IdentityId;
		} catch (e) {
			throw e;
		}
	};

	getCredentialsOrThrowError = async (
		options: GetCredentialsOrThrowErrorOptions
	): Promise<Credentials> => {
		const command = new GetCredentialsForIdentityCommand({
			IdentityId:
				options.identityId ||
				(await this.getIdentityIdOrThrowError(options.accessTokenRec)),
			Logins: options.accessTokenRec,
		});

		try {
			const response = await this.identityPoolClient.send(command);
			if (!response.Credentials) {
				throw new Error();
			}
			return response.Credentials;
		} catch (e) {
			throw e;
		}
	};

	// TODO: implement
	getAccessTokenOrThrowError = () => {
		return undefined as Promise<string>;
	};
}
