import axios from 'axios';
import { getTimeUTCString } from './datatime';
const bot_token = process.env.TELE_BOT;
const TELEGRAM_API = `https://api.telegram.org/bot${bot_token}/sendMessage`;

export const handleTeleMessage = (message: string) => {
  // Replace <ul> and </ul> tags with empty strings
  let text = message.replace(/<\/?ul>/g, '');
  // Replace <li> tags with a bullet point and a space
  text = text.replace(/<li>/g, '• ');
  // Replace </li> tags with a newline character
  text = text.replace(/<\/li>/g, '\n');
  // Replace <p> tags with empty strings
  text = text.replace(/<p>/g, '');
  // Replace </p> tags with a newline character
  text = text.replace(/<\/p>/g, '\n');
  // Remove any remaining HTML tags
  text = text.replace(/<[^>]*>/g, '');
  return text.trim();
};

export const sendToTeleGroup = async (
  message: string,
  callback?: () => void
) => {
  // const TELEGRAM_CHAT_ID = '-1002498728189';
  const TELEGRAM_CHAT_ID = process.env.MAIN_TELE_GROUP ?? '';
  const chatIds = TELEGRAM_CHAT_ID.split(',');

  const time = getTimeUTCString('YYYY-MM-DD HH:mm');

  try {
    const promises = chatIds?.map(chatId => {
      if (!chatId || chatId == '') {
        console.log('error: tele id is empty');
        return Promise.resolve();
      }

      return axios.post(TELEGRAM_API, {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      });
    });

    await Promise.all(promises);

    if (callback) {
      callback();
    }
  } catch (error) {
    console.error(
      time + ' Failed to send message to Telegram groups: ' + error
    );
  }
};

export const sendToPersonTeleId = async (
  id: string,
  message: string,
  callback?: () => void
) => {
  if (!id || id == '') {
    console.log('error: tele id is empty');
    return;
  }

  const time = getTimeUTCString('YYYY-MM-DD HH:mm');

  try {
    axios
      .post(TELEGRAM_API, {
        chat_id: id,
        text: message,
        parse_mode: 'HTML',
      })
      .then(() => {
        if (callback) {
          callback();
        }
      })
      .catch(e => {
        console.log(e);
      });
  } catch (error) {
    console.error(time + 'Failed to send message to Telegram:' + error);
  }
};

export const sendToDevTeam = async (message: string) => {
  const teamDevId = process.env.CC_DEV_TELE ?? '';
  if (!teamDevId || teamDevId == '') {
    console.log('error: dev tele id is empty');
    return;
  }
  let ccmes = 'CC Dev :\n' + message;
  const time = getTimeUTCString('YYYY-MM-DD HH:mm');

  try {
    axios.post(TELEGRAM_API, {
      chat_id: teamDevId,
      text: ccmes,
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error(time + 'Failed to send message to Telegram:' + error);
  }
};
