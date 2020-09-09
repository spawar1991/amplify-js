import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import { WordArray } from 'crypto-js';

export const OAUTH_PKCE_KEY_KEY = 'oauth_pkce_key';
export const OAUTH_STATE_KEY = 'oauth_state';

const BUFFER_TO_STRING_CHARSET =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function bufferToString(buffer: Uint8Array): string {
	const state = [];
	for (let i = 0; i < buffer.byteLength; i += 1) {
		const index = buffer[i] % BUFFER_TO_STRING_CHARSET.length;
		state.push(BUFFER_TO_STRING_CHARSET[index]);
	}
	return state.join('');
}

const GENERATE_RANDOM_CHARSET =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

export function generateRandom(): string {
	const buffer = new Uint8Array(128);

	if (window.crypto) {
		crypto.getRandomValues(buffer);
	} else {
		for (let i = 0; i < 128; i += 1) {
			buffer[i] = (Math.random() * GENERATE_RANDOM_CHARSET.length) | 0;
		}
	}

	return bufferToString(buffer);
}

const a = sha256('somn');

export function base64URL(words: WordArray) {
	return words
		.toString(Base64)
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
}

export function generateChallenge(code: string): string {
	return base64URL(sha256(code));
}

const GENERATE_STATE_CHARS =
	'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function generateState(): string {
	let result = '';
	let i = 32;
	for (; i > 0; --i)
		result +=
			GENERATE_STATE_CHARS[
				Math.round(Math.random() * (GENERATE_STATE_CHARS.length - 1))
			];
	return result;
}
