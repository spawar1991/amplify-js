import { SignUpResult, Command } from './common';

// TODO: this type is missing from "Amplify Auth Category Interface"
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ResendSignUpCodeOptions {}

export interface ResendSignUpCodeParams {
	username: string;
	options?: ResendSignUpCodeOptions;
}

export type ResendSignUpCode = Command<ResendSignUpCodeParams, SignUpResult>;
