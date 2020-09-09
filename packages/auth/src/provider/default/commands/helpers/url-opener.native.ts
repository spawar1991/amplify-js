import { Linking } from 'react-native';

export const launchUri = (url: string) => Linking.openURL(url);
