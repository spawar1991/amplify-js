import {
	ProviderDefault,
	Provider,
	Config,
	SignUp,
	ResendSignUpCode,
	ConfirmSignUp,
	GetProviderName,
	GetModuleName,
	SignInWithSocialUi,
} from './provider';

export class AuthProviderContainer implements Provider {
	provider: Provider = new ProviderDefault();
	config?: Config;

	getModuleName: GetModuleName;
	getProviderName: GetProviderName;
	signUp: SignUp;
	resendSignUpCode: ResendSignUpCode;
	confirmSignUp: ConfirmSignUp;
	signInWithSocialUi: SignInWithSocialUi;

	bindProvider() {
		this.getModuleName = this.provider.getModuleName.bind(this.provider);
		this.getProviderName = this.provider.getProviderName.bind(this.provider);
		this.signUp = this.provider.signUp.bind(this.provider);
		this.resendSignUpCode = this.provider.resendSignUpCode.bind(this.provider);
		this.confirmSignUp = this.provider.confirmSignUp.bind(this.provider);
	}

	configure(config: Config): void {
		this.config = config;
		this.provider.configure(config);
		this.bindProvider();
	}

	replacePluggable(provider: Provider): void {
		this.provider = provider;
		this.bindProvider();

		if (this.config) {
			this.provider.configure(this.config);
		}
	}

	removePluggable(): void {
		if (this.provider.getProviderName() !== 'AmazonCognito') {
			this.provider = new ProviderDefault();

			if (this.config) {
				this.provider.configure(this.config);
			}
		}
	}
}

export const Auth = new AuthProviderContainer();

export {
	ProviderDefault as AuthProviderDefault,
	Provider as AuthProvider,
	Config as AuthConfig,
};
