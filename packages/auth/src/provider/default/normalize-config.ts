import { Config } from '../interface';

// TODO: define normalized type
type RequireDeep<T> = {
	[K in keyof T]-?: Exclude<RequireDeep<T[K]>, undefined>;
};
export type NormalizedConfig = RequireDeep<Config>;

// TODO: perform validation & ensure correct signature
export function normalizeConfig(config: Config): NormalizedConfig {
	return config as RequireDeep<Config>;
}
