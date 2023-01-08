import { RedemptionMessage } from '../models/purchase';
import { store } from '../index';
import { setUserId } from '../reducers/User/User';

const PING_INTERVAL = 1000 * 10;
const TWITCH_TOPICS = {
  REDEMPTIONS: 'channel-points-channel-v1',
};
const REQUEST_MESSAGE_TYPE = {
  LISTEN: 'LISTEN',
  UNLISTEN: 'UNLISTEN',
  PING: 'PING',
};
const MESSAGE_ERRORS = {
  BAD_AUTH: 'ERR_BADAUTH',
  Forbidden: 'Forbidden',
};

export class TwitchPubSubService {
  handleRedemption: (message: RedemptionMessage) => void | Promise<void>;
  pingHandle?: any;
  ws?: WebSocket;

  constructor(handleRedemption: (message: RedemptionMessage) => void | Promise<void>) {
    this.handleRedemption = handleRedemption;
  }

  sendMessage(type: any, payload?: any): void {
    const message: any = {
      type,
    };
    if (payload) {
      message.data = {
        ...payload,
      };
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('wss://pubsub-edge.twitch.tv');
      const resolveEmpty = (): void => resolve();
      this.ws.onopen = this.onOpen.bind(this, resolveEmpty);
      this.ws.onerror = this.onError;
      this.ws.onmessage = this.receiveMessage;
      this.ws.onclose = this.onClose.bind(this, reject);
    });
  }

  listen = async (channelId: string, accessToken: string, topic = TWITCH_TOPICS.REDEMPTIONS): Promise<void> => {
    // console.log(`listen ${topic}.${channelId}`);

    if (!this.ws) {
      await this.connect();
    }

    this.sendMessage(REQUEST_MESSAGE_TYPE.LISTEN, {
      topics: [`${topic}.${channelId}`],
      auth_token: accessToken,
    });
  };

  unlisten = (channelId: string, accessToken: string, topic = TWITCH_TOPICS.REDEMPTIONS): void => {
    // console.log(`unlisten ${topic}.${channelId}`);

    this.sendMessage(REQUEST_MESSAGE_TYPE.UNLISTEN, {
      topics: [`${topic}.${channelId}`],
      auth_token: accessToken,
    });
  };

  pingConnection = (): void => {
    // console.log('ping');
    this.sendMessage(REQUEST_MESSAGE_TYPE.PING);
  };

  closeConnection = (): void => {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  };

  onOpen = (resolve: any): void => {
    this.pingConnection();
    this.pingHandle = setInterval(this.pingConnection, PING_INTERVAL);
    resolve();
  };

  onError = (error: any): void => {
    console.log(error);
  };

  onClose = (reject: any): void => {
    if (this.pingHandle) {
      clearInterval(this.pingHandle);
    }
    // console.log('Twitch PubSub connection closed');
    reject();
  };

  receiveMessage = (event: any): void => {
    const twitchPubSubMessage = JSON.parse(event.data);
    const { data } = twitchPubSubMessage;
    // console.log(`[PubSub Response Type] ${twitchPubSubMessage.type}`);

    if (twitchPubSubMessage.error === MESSAGE_ERRORS.BAD_AUTH) {
      console.log('BAD_AUTH');
      console.log(twitchPubSubMessage);
      return;
    }

    if (!data) {
      return;
    }

    switch (twitchPubSubMessage.type) {
      case 'PONG': {
        // Not implemented
        // @TODO implement
        break;
      }

      case 'RECONNECT': {
        // Not implemented
        // @TODO implement
        break;
      }

      case 'RESPONSE':
        // Not implemented
        // @TODO implement
        this.handleResponse();
        break;

      case 'MESSAGE':
        this.handleMessage(data.topic, JSON.parse(data.message));
        break;

      default:
        break;
    }
  };

  handleResponse = (): void => {
    // console.log('Response message:', message);
  };

  handleMessage = (topic: string, message: any): void => {
    const [type] = topic.split('.');

    switch (type) {
      case TWITCH_TOPICS.REDEMPTIONS:
        this.handleRedemption(message.data);
        break;

      default:
    }
  };
}

export const updateConnection = async (
  twitchPubSubService: TwitchPubSubService,
  accessToken: string,
  channelId: string,
): Promise<void> => {
  store.dispatch(setUserId(channelId));

  twitchPubSubService.unlisten(channelId, accessToken);
  await twitchPubSubService.listen(channelId, accessToken);
};
