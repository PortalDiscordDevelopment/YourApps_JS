import { Message } from 'discord.js';
import { BotCommand } from '@lib/ext/BotCommand';
import { App } from '@lib/models';
import { LogEvent } from '@lib/ext/Util';

export default class OpenCommand extends BotCommand {
	public constructor() {
		super('config-open', {
			aliases: ['config-open'],
			description: {
				content: () => this.client.t('COMMANDS.DESCRIPTIONS.CONFIG_OPEN'),
				usage: 'config open <application>',
				examples: ['config open moderator']
			},
			category: 'admin',
			args: [
				{
					id: 'application',
					type: 'application',
					match: 'rest'
				}
			],
			channel: 'guild',
			permissionCheck: 'admin'
		});
	}
	async exec(message: Message, { application }: { application?: App }) {
		if (!application) {
			await message.util!.send(
				await this.client.t('ARGS.INVALID', message, { type: 'application' })
			);
			return;
		}
		if (!application.closed) {
			await message.util!.send(
				await this.client.t('CONFIG.APPLICATION_NOT_CLOSED', message)
			);
			return;
		}
		application.closed = false;
		application.save();
		await message.util!.send(
			await this.client.t('CONFIG.APPLICATION_OPENED', message, {
				application: application.name
			})
		);
		await this.client.util.logEvent(
			message.guild!.id,
			message.author,
			LogEvent.OPEN,
			{
				application: application.name
			}
		);
	}
}
