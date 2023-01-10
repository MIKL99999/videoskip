import { ChatUserstate, Client } from 'tmi.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

import { VideoRequest, Vote, VoteCommand } from '../models/video';

dayjs.extend(duration);
dayjs.extend(relativeTime);

export class SkipBotService {
  private client: Client;
  skipMap: Map<string, number>;
  setSkipCount: ((count: number) => void) | undefined;
  ignoreUser?: string;
  videoId?: string;
  videos: VideoRequest[] = [];
  channel: string;

  skipCommand = 'скип';
  safeCommand = 'сейв';

  constructor(channel: string) {
    this.channel = channel;
    this.client = new Client({
      identity: {
        username: 'skipsome_bot',
        password: 'oauth:x5mb08s1lyszezcmqoquz0du10jxbk',
      },
      channels: [channel],
    });
    this.skipMap = new Map<string, number>();
    this.setSkipCount = undefined;

    this.client.on('message', this.handleMessage);
    this.client.on('connected', () => console.log('connected'));
    this.client.on('disconnected', () => console.log('disconnected'));

    this.client.connect();
  }

  resetSkips = (): void => {
    this.skipMap.clear();
    this.updateSkipCount();
  };

  updateSkipCount = (): void => {
    const skipCont = Array.from(this.skipMap).reduce((accum, [, value]) => accum + value, 0);

    if (this.setSkipCount) {
      this.setSkipCount(skipCont);
    }
  };

  logCurrentVideo = (tags: ChatUserstate): void => {
    this.client.say(this.channel, `@${tags['display-name']} https://youtu.be/${this.videoId}`);
  };

  logUserPosition = (tags: ChatUserstate): void => {
    const nextUserVideo = this.videos?.findIndex(({ username }) => username === tags['display-name']) || -1;

    if (nextUserVideo === -1) {
      this.client.say(this.channel, 'Вы еще не заказали видео');
    }

    const length = this.videos?.slice(0, nextUserVideo).reduce<number>((accum, { duration: d }) => accum + d, 0) || 0;

    this.client.say(
      this.channel,
      `@${tags['display-name']} твое видео на позиции ${nextUserVideo + 1} в очереди, осталось ${dayjs
        .duration(length)
        .humanize()}`,
    );
  };

  commandsMap: Record<string, (tags: ChatUserstate) => void> = {
    '!видос': this.logCurrentVideo,
    '!myvid': this.logUserPosition,
  };

  handleVote = (vote: Vote, onUpdate?: (vote: Vote) => void): void => {
    const {  command, id } = vote;
    const mapValue = command === VoteCommand.Skip ? 1 : -1;

    if (this.skipMap.get(id) !== mapValue) {
      this.skipMap.set(id, mapValue);
      this.updateSkipCount();
      onUpdate && onUpdate(vote);
    }
  };

  handleMessage = (channel: string, tags: ChatUserstate, message: string): void => {
    if (this.commandsMap[message]) {
      this.commandsMap[message](tags);

      return;
    }
    const {['user-id']: id = '', ['display-name']: username = ''} = tags

    if (tags['display-name'] === this.ignoreUser) {
      return;
    }
    if (message.startsWith(this.skipCommand)) {
      this.handleVote({ username, id, command: VoteCommand.Skip });
    }

    if (message.startsWith(this.safeCommand)) {
      this.handleVote({ username, id, command: VoteCommand.Safe });
    }
  };
}
