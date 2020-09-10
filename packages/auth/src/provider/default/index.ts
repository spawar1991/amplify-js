import {
	Provider,
	SignUp,
	ResendSignUpCode,
	ConfirmSignUp,
	SignInWithSocialUi,
	RawConfig,
} from '..';
import {
	createSignUp,
	createResendSignUpCode,
	createConfirmSignUp,
	createSignInWithOAuthCode,
	createSignInWithSocialUi,
	createDeleteAccount,
	SignInWithOAuthCode,
} from './commands';
import { normalizeConfig } from './normalize-config';
import { DeleteAccount } from '../interface';
import { Context } from './context';

export class ProviderDefault implements Provider {
	signUp: SignUp;
	resendSignUpCode: ResendSignUpCode;
	confirmSignUp: ConfirmSignUp;
	signInWithSocialUi: SignInWithSocialUi;
	deleteAccount: DeleteAccount;

	private logInWithOAuthCode: SignInWithOAuthCode;

	getModuleName = () => 'Auth' as const;
	getProviderName = () => 'AmazonCognito' as const;

	configure = (rawConfig: RawConfig) => {
		const config = normalizeConfig(rawConfig);
		const context = new Context(config);

		// exposed
		this.signUp = createSignUp(context);
		this.resendSignUpCode = createResendSignUpCode(context);
		this.confirmSignUp = createConfirmSignUp(context);
		this.signInWithSocialUi = createSignInWithSocialUi(context);
		this.deleteAccount = createDeleteAccount(context);

		// internal
		this.logInWithOAuthCode = createSignInWithOAuthCode(context);

		if (config.oauth) {
			let code: string | undefined;
			let state: string | undefined;

			for (const piece of window.location.search.substr(1).split('#')) {
				const [key, value] = piece.split('=');

				switch (key) {
					case 'code': {
						code = value;
						break;
					}

					case 'state': {
						state = value;
						break;
					}

					default: {
						break;
					}
				}
			}

			if (code) {
				this.logInWithOAuthCode({ code, state });
			}
		}
	};
}
