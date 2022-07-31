import { Sequelize } from 'sequelize';
import { resolveKey } from '@sapphire/plugin-i18next';
import { BotClient } from './BotClient';

declare module '@sapphire/pieces' {
	export interface Container {
		database: Sequelize;
		t: typeof resolveKey;
		client: BotClient;
	}
}
