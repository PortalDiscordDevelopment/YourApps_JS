import { BotCommand } from '@lib/ext/BotCommand';
import { Message } from 'discord.js';

export default class InfoCommand extends BotCommand {
	public constructor() {
		super('info', {
			aliases: ['info'],
			category: 'info',
			description: {
				content: () => this.client.i18n.t('COMMANDS.INFO_DESCRIPTION'),
				usage: 'info',
				examples: ['info']
			}
		});
	}

	public async exec(message: Message) {
		await message.util?.reply({
			embeds: [
				this.client.util
					.embed()
					.setTitle(this.client.i18n.t('GENERIC.INFO'))
					.addField(this.client.i18n.t('GENERIC.'))
			]
		});
	}
}
