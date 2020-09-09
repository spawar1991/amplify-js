import {
	Provider,
	SignUp,
	ResendSignUpCode,
	ConfirmSignUp,
	SignInWithSocialUi,
	Config,
} from '..';
import {
	createSignUp,
	createResendSignUpCode,
	createConfirmSignUp,
	createSignInWithOAuthCode,
	createSignInWithSocialUi,
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
import { normalizeConfig } from './normalize-config';
import { Context, Clients } from './context';

export class ProviderDefault implements Provider {
	authFlowType: AuthFlowType;

	signUp: SignUp;
	resendSignUpCode: ResendSignUpCode;
	confirmSignUp: ConfirmSignUp;
	signInWithSocialUi: SignInWithSocialUi;

	logInWithOAuthCode: ReturnType<typeof createSignInWithOAuthCode>;

	getModuleName = () => 'Auth' as const;
	getProviderName = () => 'AmazonCognito' as const;

	async configure(config: Config) {
		const normalizedConfig = normalizeConfig(config);

		const identityPoolClient: CognitoIdentityClient | undefined = (() => {
			if (normalizedConfig.oauth) {
				const identityPoolClient = new CognitoIdentityClient({
					region: normalizedConfig.region,
					/**
					 * @see https://github.com/aws/aws-sdk-js-v3/issues/185
					 */
					credentials: () => Promise.resolve({} as any),
				});

				if (!normalizedConfig.mandatorySignIn) {
					identityPoolClient.config.credentials = fromCognitoIdentityPool({
						identityPoolId: config.identityPoolId,
						client: identityPoolClient,
					});
				}

				return identityPoolClient;
			}
		})();

		const userPoolClient = new CognitoIdentityProviderClient({
			region: config.region,
			/**
			 * @see https://github.com/aws/aws-sdk-js-v3/issues/185
			 */
			credentials: () => Promise.resolve({} as any),
		});

		const clients: Clients = {
			identityPool: identityPoolClient,
			userPool: userPoolClient,
		};

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

		const getAuthFlowType = (): AuthFlowType => {
			return this.authFlowType;
		};

		const context: Context = {
			clients,
			config: normalizedConfig,
			getIdentityIdOrThrowError,
			getAuthFlowType,
			getCredentialsOrThrowError,
		};

		// exposed
		this.signUp = createSignUp(context);
		this.resendSignUpCode = createResendSignUpCode(context);
		this.confirmSignUp = createConfirmSignUp(context);
		this.signInWithSocialUi = createSignInWithSocialUi(context);

		// internal
		this.logInWithOAuthCode = createSignInWithOAuthCode(context);

		for (const piece of window.location.search.substr(1).split('#')) {
			const [key, value] = piece.split('=');
			if (key === 'code') {
				this.logInWithOAuthCode(value);
			}
		}
	}
}
