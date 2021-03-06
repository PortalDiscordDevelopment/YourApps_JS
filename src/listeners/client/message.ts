import { BotListener } from '@lib/ext/BotListener';
import { App } from '@lib/models';
import { type Message } from 'discord.js';
import ApplyCommand from '../../commands/applications/apply';

export default class MessageListener extends BotListener {
	public constructor() {
		super('messageCreate', {
			emitter: 'client',
			event: 'messageCreate'
		});
	}
	public async exec(message: Message) {
		if (!message.guildId) return;
		const apps = await App.findAll({
			where: {
				guild: message.guildId
			}
		});
		for (const app of apps) {
			if (!app.customcommand || message.content != app.customcommand) continue;
			if (
				(await message.author.send({}).catch(e => e.message)) ==
				'Cannot send messages to this user'
			) {
				await message.util!.send(
					await this.client.t('ERRORS.CANNOT_DM', message)
				);
				return;
			}
			const memberRoles = (await message.member!.fetch()).roles.cache;
			if (!app.requiredroles.every(r => memberRoles.has(r))) {
				await message.util!.send(
					await this.client.t('ERRORS.NO_REQUIRED_ROLES', message)
				);
				return;
			}
			if (
				app.minjointime &&
				(message.editedTimestamp ?? message.createdTimestamp) -
					message.member!.joinedTimestamp! <
					app.minjointime
			) {
				await message.util!.send(
					await this.client.t('ERRORS.NOT_JOINED_LONG_ENOUGH', message)
				);
				return;
			}
			if (app.closed) {
				await message.util!.send(
					await this.client.t('ERRORS.APP_CLOSED', message)
				);
				return;
			}
			await ApplyCommand.startApplication(message, app);
			break;
		}
	}
}
