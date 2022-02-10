import { BotCommand } from '@lib/ext/BotCommand';
import { stripIndent } from 'common-tags';
import { GatewayInteractionCreateDispatchData } from 'discord-api-types';
import {
	ButtonInteraction,
	Interaction,
	Message,
	MessageActionRow,
	MessageButton
} from 'discord.js';
import got, { HTTPError } from 'got/dist/source';

type Fuckery = GatewayInteractionCreateDispatchData & {
	data: {
		components: { components: { custom_id: string; value: string }[] }[];
	};
};

// Create an akairo command
export default class TestCommand extends BotCommand {
	public constructor() {
		super('test', {
			aliases: ['test'],
			category: 'Other',
			description: {
				content: async () => 'Test command',
				usage: 'test',
				examples: ['test']
			}
		});
	}

	private questions = [
		[
			'what is your name',
			'what is your favorite color',
			'what is the airspeed velocity of an unladen swallow',
			'african or european?',
			"I DON'T KNOW THAT!"
		],
		['AAAAAAAAAAAAAAAAAAAAAAAAAA']
	];
	private page = 1;
	private completedPages: number[] = [];

	public async exec(message: Message) {
		const ids = {
			prev: 'prev' + message.id,
			next: 'next' + message.id,
			open: 'open' + message.id
		};
		const m = await message.reply({
			content: `You are on page ${this.page}`,
			components: [
				new MessageActionRow().addComponents(
					new MessageButton()
						.setCustomId(ids.prev)
						.setLabel('Prev')
						.setStyle('SUCCESS')
						.setEmoji('⬅'),
					new MessageButton()
						.setCustomId(ids.next)
						.setLabel('Next')
						.setStyle('SUCCESS')
						.setEmoji('➡'),
					new MessageButton()
						.setCustomId(ids.open)
						.setLabel('Open')
						.setStyle('SUCCESS')
						.setEmoji('🔍')
				)
			]
		});
		const i = m.createMessageComponentCollector({
			componentType: 'BUTTON',
			filter: i => Object.values(ids).includes(i.customId)
		});
		i.on('collect', async (i: ButtonInteraction) => {
			switch (i.customId) {
				case ids.prev:
					if (this.page <= 1) {
						await i.reply({
							content: 'You cannot go back any further!',
							ephemeral: true
						});
					} else {
						this.page--;
						await i.update(`You are on page ${this.page}`);
					}
					break;
				case ids.next:
					if (this.page >= this.questions.length) {
						await i.reply({
							content: 'You cannot go forward any further!',
							ephemeral: true
						});
					} else {
						this.page++;
						await i.update(`You are on page ${this.page}`);
					}
					break;
				case ids.open:
					await this.getModal(i);
					break;
			}
		});
	}

	private async getModal(i: ButtonInteraction) {
		await this.sendResponse(i, {
			type: 9,
			data: {
				title: 'my epic modal',
				custom_id: 'cool_modal',
				components: this.questions[this.page - 1].map((q, i) => ({
					type: 1,
					components: [
						{
							type: 4,
							custom_id: i.toString(),
							label: q.length > 45 ? q.substring(0, 43) + '…' : q,
							style: 2,
							min_length: 1,
							max_length: 4000,
							placeholder: q,
							required: Boolean(Math.floor(Math.random() * 2))
						}
					]
				}))
			}
		});
		const ii = await new Promise<Fuckery>(r =>
			this.client.ws.once('INTERACTION_CREATE', r)
		);
		const answers: Record<string, string> = {};
		for (const row of ii.data.components) {
			for (const field of row.components) {
				answers[this.questions[this.page - 1][Number(field.custom_id)]] =
					field.value;
			}
		}
		console.log(answers);
		await this.sendResponse(ii, {
			type: 4,
			data: {
				content: stripIndent`
					Saved page ${this.page}.
					Pages left: ${this.questions
						.map((_, i) => i)
						.filter(i => !this.completedPages.includes(i))
						.join(', ')}
					Completed pages: ${this.completedPages.join(', ')}
				`,
				flags: 1 << 6
			}
		});
	}

	private async sendResponse(
		i: Interaction | Fuckery,
		json: Record<string, unknown>
	) {
		return await got
			.post(
				`https://discord.com/api/v9/interactions/${i.id}/${i.token}/callback`,
				{
					json
				}
			)
			.catch(e => console.error((e as HTTPError).response.body));
	}
}
