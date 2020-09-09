import { ConfirmSignUp, SignUpResult } from '../..';
import { ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CommandFactory } from '../context';

export const createConfirmSignUp: CommandFactory<ConfirmSignUp> = context => async input => {
	const AnalyticsMetadata =
		input.options &&
		input.options.pluginOptions &&
		input.options.pluginOptions.analyticsMetadata;

	const command = new ConfirmSignUpCommand({
		ClientId: context.config.userPoolWebClientId,
		Username: input.username,
		ConfirmationCode: input.code,
		AnalyticsMetadata,
	});

	const response = await context.clients.userPool.send(command);

	const result: SignUpResult = { isSignUpComplete: true };

	return result;
};
