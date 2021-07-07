import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel';

interface ModelAttributes {
	id: string;
	prefixes: string[];
	logchannel: Snowflake;
	archivechannel: Snowflake;
	logpings: Snowflake[];
	adminroles: Snowflake[];
	reviewroles: Snowflake[];
	blacklistroles: Snowflake[];
}

interface ModelCreationAttributes {
	id: string;
	prefixes?: string[];
	logchannel?: Snowflake;
	archivechannel?: Snowflake;
	logpings?: Snowflake[];
	adminroles?: Snowflake[];
	reviewroles?: Snowflake[];
	blacklistroles?: Snowflake[];
}

export class Guild extends BaseModel<ModelAttributes, ModelCreationAttributes> {
	declare id: string;
	declare prefixes: string[];
	declare logchannel: Snowflake | null;
	declare archivechannel: Snowflake | null;
	declare logpings: Snowflake[];
	declare adminroles: Snowflake[];
	declare reviewroles: Snowflake[];
	declare blacklistroles: Snowflake[];
	static initModel(sequelize: Sequelize, defaultPrefix: string) {
		Guild.init(
			{
				id: {
					type: DataTypes.STRING,
					primaryKey: true,
					allowNull: false
				},
				prefixes: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: false,
					defaultValue: [defaultPrefix]
				},
				logchannel: {
					type: DataTypes.STRING,
					allowNull: true
				},
				logpings: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: false,
					defaultValue: []
				},
				archivechannel: {
					type: DataTypes.STRING,
					allowNull: true
				},
				adminroles: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: false,
					defaultValue: []
				},
				reviewroles: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: false,
					defaultValue: []
				},
				blacklistroles: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: false,
					defaultValue: []
				}
			},
			{ sequelize }
		);
	}
}
