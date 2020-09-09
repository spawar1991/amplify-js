export interface CookieConfig {
	domain: string;
	path?: string;
	expires?: number;
	secure?: boolean;
	sameSite?: 'strict' | 'lax' | 'none';
}

export interface Storage {
	setItem(key: string, value: string): void;
	getItem(key: string): string | null;
	removeItem(key: string): void;
}

export interface AwsCognitoOAuthOpts {
	domain: string;
	scope: Array<string>;
	redirectSignIn: string;
	redirectSignOut: string;
	responseType: string;
	options?: object;
	urlOpener?: (url: string, redirectUrl: string) => Promise<any>;
}

export interface Auth0OAuthOpts {
	domain: string;
	clientID: string;
	scope: string;
	redirectUri: string;
	audience: string;
	responseType: string;
	returnTo: string;
	urlOpener?: (url: string, redirectUrl: string) => Promise<any>;
}

export type OAuthOpts = AwsCognitoOAuthOpts | Auth0OAuthOpts;

export interface Config {
	userPoolId?: string;
	userPoolWebClientId?: string;
	identityPoolId?: string;
	region?: string;
	mandatorySignIn?: boolean;
	cookieStorage?: CookieConfig;
	oauth?: OAuthOpts;
	refreshHandlers?: object;
	storage?: Storage;
	authenticationFlowType?: string;
	identityPoolRegion?: string;
	clientMetadata?: any;
}
