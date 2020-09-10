import { SignInWithSocialUi } from '../..';
import {
	generateRandom,
	generateChallenge,
	generateState,
	OAUTH_PKCE_KEY_KEY,
	OAUTH_STATE_KEY,
	CommandFactory,
} from './helpers';
import { launchUri } from './helpers/url-opener';

export const createSignInWithSocialUi: CommandFactory<SignInWithSocialUi> = context => async input => {
	const pkseKey = generateRandom();
	sessionStorage.setItem(OAUTH_PKCE_KEY_KEY, pkseKey);
	const codeChallenge = generateChallenge(pkseKey);

	const state = generateState();
	sessionStorage.setItem(OAUTH_STATE_KEY, encodeURIComponent(state));

	const scope = context.config.oauth.scope;

	const queryParams = {
		identity_provider: input.socialProvider || 'COGNITO',
		scopes: typeof scope === 'string' ? scope : scope.join(' '),
		client_id: context.config.userPoolWebClientId,
		// @ts-ignore –– TODO: define `redirectSignIn` on `Config` type
		code_verifier: context.config.redirectSignIn as string,
		code_challenge: codeChallenge,
		code_challenge_name: 'S256',
		state,
	};

	const uri = Object.entries(queryParams).reduce(([key, value], acc) => {
		return `${acc}&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
	}, `https://${context.config.oauth.domain}/oauth2/authorize?response_type=code`);

	launchUri(uri);
};
