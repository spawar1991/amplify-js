import {
	CognitoIdentityProviderClient,
	AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import {
	CognitoIdentityClient,
	Credentials as IdentityPoolCredentials,
} from '@aws-sdk/client-cognito-identity';
import { NormalizedConfig } from './normalize-config';

export interface Clients {
	identityPool?: CognitoIdentityClient;
	userPool?: CognitoIdentityProviderClient;
}

export interface Context {
	config: NormalizedConfig;
	clients: Clients;
	getAccessTokenOrThrowError(): Promise<string>;
	getIdentityIdOrThrowError(
		accessTokenRec?: Record<string, string>
	): Promise<string>;
	getAuthFlowType(): AuthFlowType;
	getCredentialsOrThrowError(options: {
		identityId?: string;
		accessTokenRec?: Record<string, string>;
	}): Promise<IdentityPoolCredentials>;
}

export type CommandFactory<Command> = (context: Context) => Command;
