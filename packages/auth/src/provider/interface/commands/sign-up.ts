import { SignUpOptions, SignUpResult, Command } from './common';

export interface SignUpParams {
	username: string;
	password?: string;
	options?: SignUpOptions;
}

export type SignUp = Command<SignUpParams, SignUpResult>;
