import { ResendSignUpCode, SignUpResult, DeliveryMedium } from '../..';
import { ResendConfirmationCodeCommand } from '@aws-sdk/client-cognito-identity-provider';
import { SignUpStep } from '../../interface';
import { CommandFactory } from './command-factory';

export const createResendSignUpCode: CommandFactory<ResendSignUpCode> = context => async input => {
	const command = new ResendConfirmationCodeCommand({
		ClientId: context.config.userPoolWebClientId,
		Username: input.username,
	});

	const response = await context.userPoolClient.send(command);

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
