import { SignInWithSocialUi } from '../..';
import { CommandFactory } from '../context';

export const createSignInWithSocialUi: CommandFactory<SignInWithSocialUi> = context => async input => {
	// @ts-ignore –– TODO: define `redirectSignIn` on `Config` type
	window.location.href = `https://${context.config.oauth.domain}/login?response_type=code&client_id=${context.config.userPoolWebClientId}&redirect_uri=${context.config.redirectSignIn}`;
};
