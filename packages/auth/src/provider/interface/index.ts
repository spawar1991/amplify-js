import * as commands from './commands';
import { Config } from './config';

export * from './commands';
export * from './config';

export type GetModuleName = () => 'Auth';
export type GetProviderName = () => string;
export type Configure = (config: Config) => void;

export interface Provider {
	getModuleName: GetModuleName;
	getProviderName: GetProviderName;
	configure: Configure;
	signUp: commands.SignUp;
	resendSignUpCode: commands.ResendSignUpCode;
	confirmSignUp: commands.ConfirmSignUp;
	signInWithSocialUi: commands.SignInWithSocialUi;
}
