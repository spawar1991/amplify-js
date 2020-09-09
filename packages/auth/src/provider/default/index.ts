import { AuthProvider, SignUp, ResendSignUpCode, ConfirmSignUp } from '..';
import {
	createSignUp,
	createResendSignUpCode,
	createConfirmSignUp,
	createLogInWithOAuthCode,
} from './commands';
import {
	CognitoIdentityProviderClient,
	AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import {
	CognitoIdentityClient,
	GetIdCommand,
	GetCredentialsForIdentityCommand,
	Credentials as IdentityPoolCredentials,
} from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { AuthOptions as Config } from '../../types';
import { normalizeConfig } from './normalize-config';
import { Context } from './context';

function IdentityPoolClient(config: Config): CognitoIdentityClient {
	const identityClient = new CognitoIdentityClient({
		region: config.region,
	});

	if (!config.mandatorySignIn) {
		const unauthCredentialsProvider = fromCognitoIdentityPool({
			identityPoolId: config.identityPoolId,
			client: identityClient,
		});

		identityClient.config.credentials = unauthCredentialsProvider;
	}

	return identityClient;
}

function UserPoolClient(config: Config): CognitoIdentityProviderClient {
	return new CognitoIdentityProviderClient({
		region: config.region,
	});
}

// function Credentials(client: CognitoIdentityClient, identityId: string) {
// 	return fromCognitoIdentity({
// 		client,
// 		identityId,
// 	});
// }

export class AuthProviderDefault implements AuthProvider {
	signUp: SignUp;
	resendSignUpCode: ResendSignUpCode;
	confirmSignUp: ConfirmSignUp;
	authFlowType: AuthFlowType;
	logInWithOAuthCode: ReturnType<typeof createLogInWithOAuthCode>;

	getModuleName() {
		return 'Auth' as const;
	}

	getProviderName() {
		return 'AmazonCognito';
	}

	async configure(config: Config) {
		const normalizedConfig = normalizeConfig(config);

		/**
		 * Instantiate credential-free user pool and identity pool clients
		 */
		const identityPoolClient = IdentityPoolClient(normalizedConfig);
		const userPoolClient = UserPoolClient(normalizedConfig);

		/**
		 * Get an identity ID
		 */
		const getIdentityIdOrThrowError = async (
			accessTokenRec?: Record<string, string>
		): Promise<string> => {
			const command = new GetIdCommand({
				IdentityPoolId: normalizedConfig.identityPoolId,
				Logins: accessTokenRec,
			});

			try {
				const response = await identityPoolClient.send(command);
				if (!response.IdentityId) {
					throw new Error();
				}
				return response.IdentityId;
			} catch (e) {
				throw e;
			}
		};

		/**
		 * Get AWS credentials from an `IdentityId`
		 *
		 * @param accessTokenRec – access tokens to send along with the request
		 */
		const getCredentialsOrThrowError = async (
			accessTokenRec?: Record<string, string>
		): Promise<IdentityPoolCredentials> => {
			const command = new GetCredentialsForIdentityCommand({
				IdentityId: await getIdentityIdOrThrowError(),
				Logins: accessTokenRec,
			});

			try {
				const response = await identityPoolClient.send(command);
				if (!response.Credentials) {
					throw new Error();
				}
				return response.Credentials;
			} catch (e) {
				throw e;
			}
		};

		/**
		 * Get the current auth flow type
		 */
		const getAuthFlowType = (): AuthFlowType => {
			return this.authFlowType;
		};

		/**
		 * Expose the data & utils defined in this constructor to the various methods, assigned below
		 */
		const context: Context = {
			config: normalizedConfig,
			identityPoolClient,
			userPoolClient,
			getIdentityIdOrThrowError,
			getAuthFlowType,
			getCredentialsOrThrowError,
		};

		// exposed
		this.signUp = createSignUp(context);
		this.resendSignUpCode = createResendSignUpCode(context);
		this.confirmSignUp = createConfirmSignUp(context);

		// internal
		this.logInWithOAuthCode = createLogInWithOAuthCode(context);

		for (const piece of window.location.search.substr(1).split('#')) {
			const [key, value] = piece.split('=');
			if (key === 'code') {
				this.logInWithOAuthCode(value);
			}
		}
	}
}
