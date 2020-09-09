import { SignUp, CommandFactory, SignUpResult, DeliveryMedium } from '../..';
import { SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { SignUpStep } from '../../interface';

export const createSignUp: CommandFactory<SignUp> = context => async input => {
	const ClientMetadata = input.options.pluginOptions;
	const UserAttributes = input.options.userAttributes;

	// TODO: handle no password
	const command = new SignUpCommand({
		ClientId: context.getClientIdOrThrowError(),
		Password: input.password,
		Username: input.username,
		ClientMetadata,
		UserAttributes,
	});

	const response = await context
		.getIdentityProviderClientOrThrowError()
		.send(command);

	const result: SignUpResult = {
		isSignUpComplete: response.UserConfirmed,
		nextStep: response.CodeDeliveryDetails
			? {
					additionalInfo: {},
					codeDeliveryDetails: {
						destination: response.CodeDeliveryDetails.Destination,
						deliveryMedium: response.CodeDeliveryDetails
							.DeliveryMedium as DeliveryMedium,
						attributeName: response.CodeDeliveryDetails.AttributeName,
					},
					signUpStep: response.UserConfirmed
						? SignUpStep.DONE
						: SignUpStep.CONFIRM_SIGN_UP,
			  }
			: undefined,
	};

	return result;
};
