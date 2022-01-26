import { MessageEmbed } from 'discord.js';

export const praiseErrorEmbed = (title: string, description: string) => {
  return new MessageEmbed()
    .setColor('#ff0000')
    .setTitle(`ERROR: ${title}`)
    .setDescription(description)
    .setFooter({ text: 'PRAISE DID NOT REGISTER' });
};

export const praiseSuccessEmbed = (praised: string[]) => {
  return new MessageEmbed()
    .setColor('#00ff00')
    .setTitle(`SUCCESSFULLY PRAISED!`)
    .setDescription(`Praised ${praised.join(', ')}.`)
    .setFooter({ text: 'PRAISE REGISTERED' });
};
