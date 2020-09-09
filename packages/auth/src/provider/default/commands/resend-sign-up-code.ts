import {
	ResendSignUpCode,
	CommandFactory,
	SignUpResult,
	DeliveryMedium,
} from '../..';
import { ResendConfirmationCodeCommand } from '@aws-sdk/client-cognito-identity-provider';
import { SignUpStep } from '../../interface';

export const createResendSignUpCode: CommandFactory<ResendSignUpCode> = context => async input => {
	const command = new ResendConfirmationCodeCommand({
		ClientId: context.getClientIdOrThrowError(),
		Username: input.username,
	});

	const response = await context
		.getIdentityProviderClientOrThrowError()
		.send(command);

	const result: SignUpResult = {
		isSignUpComplete: false,
		nextStep: response.CodeDeliveryDetails
			? {
					additionalInfo: {},
					codeDeliveryDetails: {
						destination: response.CodeDeliveryDetails.Destination,
						deliveryMedium: response.CodeDeliveryDetails
							.DeliveryMedium as DeliveryMedium,
						attributeName: response.CodeDeliveryDetails.AttributeName,
					},
					signUpStep: SignUpStep.CONFIRM_SIGN_UP,
			  }
			: undefined,
	};

	return result;
};
