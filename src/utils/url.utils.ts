// eslint-disable-next-line import/prefer-default-export
import { getCookie, isProduction } from './common.utils';

export const getQueryValue = (url: string, queryName: string): string | null => {
  const regexp = new RegExp(`[?&]${queryName}=([^&]*)&|[?&]${queryName}=([^&]*)$`);
  const query = regexp.exec(url);
  return query && (query[1] || query[2]);
};

const urlRegExp = /(https:\/\/[^\s]*)/;

export const splitByUrls = (text: string): string[] => {
  return text.split(urlRegExp);
};

export const getWebsocketUrl = (): string =>
  isProduction()
    ? `wss://backend-old.onrender.com?jwtToken=${getCookie('jwtToken')}&isVideoRequest=true`
    : `ws://localhost:8000?jwtToken=${getCookie('jwtToken')}&isVideoRequest=true`;

export const getSocketIOUrl = (): string =>
  isProduction()
    ? `https://backend-old.onrender.com/skipExtension`
    : `http://localhost:8000/skipExtension`;

export const parseYoutubeUrl = (url: string): string | null => {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  }
  return null;
};
