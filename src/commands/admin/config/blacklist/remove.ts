import { Message } from 'discord.js';
import { BotCommand } from '@lib/ext/BotCommand';
import { Guild } from '@lib/models';
import { Role } from 'discord.js';
import { LogEvent } from '@lib/ext/Util';

export default class ConfigBlacklistRemoveCommand extends BotCommand {
	public constructor() {
		super('config-blacklist-remove', {
			aliases: ['config-blacklist-remove'],
			description: {
				content: () =>
					this.client.t('COMMANDS.DESCRIPTIONS.CONFIG_BLACKLIST_REMOVE'),
				usage: 'config blacklist remove <role>',
				examples: ['config blacklist remove Moderator']
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
	async exec(message: Message, { role }: { role?: Role|number }) {
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
                const roleId = role instanceof Role ? role.id : role.toString();
		if (!guildEntry.blacklistroles.includes(roleId)) {
			await message.util!.send(
				await this.client.t('CONFIG.BLACKLIST_ROLE_NOT_ADDED', message)
			);
			return;
		}
		guildEntry.blacklistroles.splice(
			guildEntry.blacklistroles.indexOf(roleId),
			1
		);
		guildEntry.changed('blacklistroles', true);
		await guildEntry.save();
		await message.util!.send(
			await this.client.t('CONFIG.BLACKLIST_ROLE_REMOVED', message, {
				roleID: roleId
			})
		);
		await this.client.util.logEvent(
			message.guild!.id,
			message.author,
			LogEvent.BLACKLIST_ROLE_REMOVE,
			{ roleID: roleId }
		);
	}
}
