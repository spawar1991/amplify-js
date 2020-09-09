import { Command, IdentityProvider } from './common';

export interface SignInWithUIOptions {}

export interface SignInWithSocialUiParams {
	// union prevents type error for TypeScript users who'd prefer not to import the enum
	socialProvider?: IdentityProvider | IdentityProvider[keyof IdentityProvider];
	options?: SignInWithUIOptions;
}

export type SignInWithSocialUi = Command<SignInWithSocialUiParams, void>;
