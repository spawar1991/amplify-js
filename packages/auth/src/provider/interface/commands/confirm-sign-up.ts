import { SignUpOptions, SignUpResult, Command } from './common';

export interface ConfirmSignUpParams {
	username: string;
	code: string;
	options?: SignUpOptions;
}

export type ConfirmSignUp = Command<ConfirmSignUpParams, SignUpResult>;
