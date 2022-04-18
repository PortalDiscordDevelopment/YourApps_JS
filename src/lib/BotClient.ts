// * Load sapphire plugins
import '@sapphire/plugin-logger/register'; // Load logger
import '@sapphire/plugin-i18next/register'; // Load i18next

import { LogLevel, SapphireClient } from '@sapphire/framework';
import { Sequelize } from 'sequelize';
import * as config from '../options/config';
import * as Models from './models';
import { container } from '@sapphire/pieces';
import type { CommandInteraction } from 'discord.js';
import i18n from 'i18next';
import I18nBackend from 'i18next-fs-backend';
import { join } from 'path';
import { promises as fs } from 'fs';

export class BotClient extends SapphireClient {
	public database: Sequelize;
	public i18n: typeof i18n;

	public constructor() {
		super({
			intents: ['GUILDS', 'GUILD_MESSAGES'],
			logger: { level: LogLevel.Debug }
		});
		this.database = new Sequelize({
			database: 'yourapps',
			dialect: 'postgres',
			username: config.database.username,
			password: config.database.password,
			host: config.database.host,
			port: config.database.port,
			logging: sql => this.logger.trace(sql)
		});
		this.i18n = i18n;
		Models.App.initModel(this.database);
		Models.AppButton.initModel(this.database);
		Models.Guild.initModel(this.database, config.defaultPrefix);
		Models.Submission.initModel(this.database);
		Models.User.initModel(this.database);
		container.database = this.database;
		container.i18n = this.i18n;
	}

	public async initialize() {
		this.logger.info('[Init] Logging into the database...');
		await this.database.authenticate();
		this.logger.info('[Init] Logged in, syncing models...');
		await this.database.sync({ alter: true });
		this.logger.info('[Init] Synced models, initializing i18n...');
		const languages = await fs.readdir(
			join(__dirname, '..', '..', 'src', 'languages')
		);
		await this.i18n.use(I18nBackend).init({
			supportedLngs: languages,
			fallbackLng: languages[0],
			ns: ['bot'],
			fallbackNS: 'bot',
			interpolation: {
				escapeValue: false
			},
			backend: {
				loadPath: join(
					__dirname,
					'..',
					'..',
					'src',
					'languages',
					'{{lng}}',
					'{{ns}}.json'
				),
				addPath: join(
					__dirname,
					'..',
					'..',
					'src',
					'languages',
					'{{lng}}',
					'{{ns}}.missing.json'
				)
			},
			preload: languages
		});
	}

	public async start() {
		await this.initialize();
		return this.login(config.token);
	}

	public async t(
		interaction: CommandInteraction,
		key: string,
		options: Record<string, unknown>
	): Promise<string> {
		const user = await Models.User.findByPk(interaction.user.id);
		if (user) {
		}
		return '';
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		database: Sequelize;
		i18n: typeof i18n;
		t: typeof BotClient.prototype.t;
	}
}
