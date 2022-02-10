import { BotListener } from '@lib/ext/BotListener';
import {
	GatewayInteractionCreateDispatch,
	GatewayInteractionCreateDispatchData
} from 'discord-api-types';
import type { ButtonInteraction, Interaction } from 'discord.js';
import got from 'got';

export default class InteractionCreateListener extends BotListener {
	public constructor() {
		super('interactionCreate', {
			emitter: 'client',
			event: 'interactionCreate'
		});
	}

	public async exec(i: ButtonInteraction) {
		//
	}
}
