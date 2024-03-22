const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const getServerIconUrl = require('../services/server-icon-parser.js');
const colors = require('../assets/colors.js');
const randomQuote = require('../modules/random-quote');
const icons = require('../assets/icons.js');
const commandLogger = require('../logger/command-logger');
const getCharacterInfo = require('../modules/maple-api-modules/maple-character-info.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('검색')
		.setDescription('용사님의 정보를 라라가 알아봐 드릴게요!')
		.addStringOption(option => 
			option.setName('닉네임')
				.setDescription('닉네임을 입력하세요.')
				.setRequired(true)),
	async execute(interaction) {
		commandLogger.logCommandUsage(interaction); //로그 기록
		const nickname = interaction.options.getString('닉네임');
		
		try {
      const userInfo = await getCharacterInfo(nickname);

			const embed = new EmbedBuilder()
        .setAuthor({ name: '\u200B', iconURL: getServerIconUrl(userInfo.world_name)})
				.setTitle(`**「   ${nickname}   」**`)
				.setColor(colors.primary)
				.setThumbnail(userInfo.character_image)
				.setDescription(`> ${userInfo.character_class}\n`, inline = false)
				.addFields(
					{ name: '【 레벨 】', value: `\`${userInfo.character_level}\``, inline: true },
					{ name: '【 경험치 】', value: ` \`${(userInfo.character_exp_rate)}% (${userInfo.character_exp})\``, inline: false },
					//{ name: '【 인기도 】', value: `\`${userInfo.pop}\``, inline: true },
					{ name: '【 길드 】', value: userInfo.character_guild_name && userInfo.character_guild_name.length > 0 ? `\`${userInfo.character_guild_name}\`` : '없음', inline: true })
				.setFooter({ text: randomQuote.getRandomQuote(), iconURL: icons.mapleLeap });
			await interaction.reply({ embeds: [embed] });
		} catch (error) {
			commandLogger.logCommandIssue(interaction, error); //로그 기록
			// 오류가 발생한 경우 사용자에게 알려줄 임베드 생성
			const embed = new EmbedBuilder()
				.setColor(colors.error)
				.setTitle("입력한 닉네임의 용사님을 찾을 수 없어요!")
				.setDescription("메이플스토리 랭킹 서버에 등록되어 있지 않거나, 잘못된 닉네임을 입력하셨어요. 다시 입력해주세요!");
        console.error(error);
			await interaction.reply({ embeds: [embed] });
		}
	},
};