const SELF = '_self';

export const launchUri = (url: string) => {
	const windowProxy = window.open(url, SELF);
	if (windowProxy) {
		return Promise.resolve(windowProxy);
	} else {
		return Promise.reject();
	}
};
