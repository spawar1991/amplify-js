import { SignUp, SignUpResult, DeliveryMedium, SignUpStep } from '../..';
import { SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CommandFactory } from './helpers';

export const createSignUp: CommandFactory<SignUp> = context => async input => {
	const ClientMetadata = input.options && input.options.pluginOptions;
	const UserAttributes = input.options && input.options.userAttributes;

	const command = new SignUpCommand({
		ClientId: context.config.userPoolWebClientId,
		Password: input.password,
		Username: input.username,
		ClientMetadata,
		UserAttributes,
	});

	const response = await context.userPoolClient.send(command);

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
