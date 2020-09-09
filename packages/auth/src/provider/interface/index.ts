import * as commands from './commands';
import { AuthOptions } from '../../types';

export * from './commands';
export * from './config';

export interface AuthProvider {
	getModuleName(): 'Auth';
	getProviderName(): string;
	configure(config: AuthOptions): void;
	signUp: commands.SignUp;
	resendSignUpCode: commands.ResendSignUpCode;
	confirmSignUp: commands.ConfirmSignUp;
}
