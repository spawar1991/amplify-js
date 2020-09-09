export interface UserAttribute {
	Name: string;
	Value: string;
}

export interface SignUpOptions {
	userAttributes: UserAttribute[];
	pluginOptions?: any;
}

export enum SignUpStep {
	CONFIRM_SIGN_UP = 'CONFIRM_SIGN_UP',
	DONE = 'DONE',
}

export enum DeliveryMedium {
	EMAIL = 'EMAIL',
	SMS = 'SMS',
	UNKNOWN = 'UNKNOWN',
}

export interface CodeDeliveryDetails {
	destination: string;
	deliveryMedium: DeliveryMedium;
	attributeName: string | ((value: string) => string);
}

export interface NextSignUpStep {
	signUpStep: SignUpStep;
	additionalInfo: Record<string, string>;
	codeDeliveryDetails: CodeDeliveryDetails;
}

export interface SignUpResult {
	isSignUpComplete: boolean;
	nextStep?: NextSignUpStep;
}

export type Command<I, O> = (input: I) => Promise<O>;
