// TODO: complete

import { Credentials } from '@aws-sdk/client-cognito-identity';
import {
	AuthenticationResultType,
	GetUserCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { Storage } from '../../..';

const SESSION_KEY = 'previousSession';

export class Session {
	userInfo?: GetUserCommandOutput;
	credentials?: Credentials;
	authenticationResult?: AuthenticationResultType;

	constructor(public storage: Storage) {
		if (storage) {
			const previousSessionSerialized =
				storage.getItem(SESSION_KEY) || undefined;
			if (previousSessionSerialized) {
				const previousSession = JSON.parse(
					previousSessionSerialized
				) as Session;
				Object.assign(this, previousSession);
			}
		}
	}

	save() {
		this.storage.setItem(
			SESSION_KEY,
			JSON.stringify({
				...(this.userInfo ? { userInfo: this.userInfo } : {}),
				...(this.credentials ? { credentials: this.credentials } : {}),
				...(this.authenticationResult
					? { authenticationResult: this.authenticationResult }
					: {}),
			})
		);
	}
}
