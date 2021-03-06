import { Message } from 'discord.js';
import { BotCommand } from '@lib/ext/BotCommand';
import { Guild } from '@lib/models';
import { Role } from 'discord.js';
import { LogEvent } from '@lib/ext/Util';

export default class ConfigBlacklistAddCommand extends BotCommand {
	public constructor() {
		super('config-blacklist-add', {
			aliases: ['config-blacklist-add'],
			description: {
				content: () =>
					this.client.t('COMMANDS.DESCRIPTIONS.CONFIG_BLACKLIST_ADD'),
				usage: 'config blacklist add <role>',
				examples: ['config blacklist add Blacklisted']
			},
			category: 'admin',
			args: [
				{
					id: 'role',
					type: 'role'
				}
			],
			channel: 'guild',
			permissionCheck: 'admin'
		});
	}
	async exec(message: Message, { role }: { role?: Role }) {
		if (!role) {
			await message.util!.send(
				await this.client.t('ARGS.PLEASE_GIVE', message, { type: 'role' })
			);
			return;
		}
		const [guildEntry] = await Guild.findOrBuild({
			where: {
				id: message.guild!.id
			},
			defaults: {
				id: message.guild!.id
			}
		});
		if (guildEntry.blacklistroles.includes(role.id)) {
			await message.util!.send(
				await this.client.t('CONFIG.BLACKLIST_ROLE_ALREADY_ADDED', message)
			);
			return;
		}
		guildEntry.blacklistroles.push(role.id);
		guildEntry.changed('blacklistroles', true);
		await guildEntry.save();
		await message.util!.send(
			await this.client.t('CONFIG.BLACKLIST_ROLE_ADDED', message, {
				roleID: role.id
			})
		);
		await this.client.util.logEvent(
			message.guild!.id,
			message.author,
			LogEvent.BLACKLIST_ROLE_ADD,
			{ roleID: role.id }
		);
	}
}
