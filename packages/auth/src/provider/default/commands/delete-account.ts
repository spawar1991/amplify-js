import { DeleteAccount } from '../..';
import { DeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CommandFactory } from '../context';

export const createDeleteAccount: CommandFactory<DeleteAccount> = context => async () => {
	const command = new DeleteUserCommand({
		AccessToken: await context.getAccessTokenOrThrowError(),
	});

	await context.clients.userPool.send(command);

	return;
};
