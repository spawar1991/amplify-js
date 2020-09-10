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
} from './commands';
import { AuthFlowType } from '@aws-sdk/client-cognito-identity-provider';
import { normalizeConfig } from './normalize-config';
import { DeleteAccount } from '../interface';
import { Context } from './context';

export class ProviderDefault implements Provider {
	authFlowType: AuthFlowType;

	signUp: SignUp;
	resendSignUpCode: ResendSignUpCode;
	confirmSignUp: ConfirmSignUp;
	signInWithSocialUi: SignInWithSocialUi;
	deleteAccount: DeleteAccount;

	logInWithOAuthCode: ReturnType<typeof createSignInWithOAuthCode>;

	getModuleName = () => 'Auth' as const;
	getProviderName = () => 'AmazonCognito' as const;

	async configure(rawConfig: RawConfig) {
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

		for (const piece of window.location.search.substr(1).split('#')) {
			const [key, value] = piece.split('=');
			if (key === 'code') {
				this.logInWithOAuthCode(value);
			}
		}
	}
}
