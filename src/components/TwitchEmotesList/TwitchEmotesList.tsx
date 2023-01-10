import React, { FC, useCallback, useEffect, useState } from 'react';
import { CircularProgress, IconButton } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { RootState } from '../../reducers';
import './TwitchEmotesList..scss';
import { EmoteData } from '../../models/common.model';
// @ts-ignore
import { EmoteFetcher, Collection, Emote } from '@kozjar/twitch-emoticons';
import axios from "axios";
// @ts-ignore
import SevenTV, { SevenTVEmote } from '7tv';

const fetcher = new EmoteFetcher();

interface TwitchEmotesListProps {
  setActiveEmote: (emote: EmoteData) => void;
  token: string | null
}

interface IEmote {
  min?: number,
  max?: number,
  id?: string,
  toLink: Emote['toLink'],
  code: string,
}

interface IEmotesList {
  id: string
  collection?: Collection<string, IEmote>
}

const getTwitchGlobalEmotes = async (token: string): Promise<Collection<string, IEmote>> => {
  const { data: { data } } = await axios.get('https://api.twitch.tv/helix/chat/emotes/global', {
    headers: {
      'Client-Id': '75rqv1jdoyvwyes1rlw6dcsx9pidbr',
      Authorization: `Bearer ${token}`
    }
  })

  const emotes = data.map(({ name, id, images }: any) => {
    if (!images['url_4x']) {
      console.log('WTF')
      console.log(name);
    }
    return ({
      toLink: (size: number): string => images[`url_${size}x`],
      code: name,
      id,
      min: 1,
      max: 4,
    });
  })

  return { values: () => emotes }
}

const sevenTVApi = SevenTV();
const createSevenTVEmote = ({ id, width, name }: SevenTVEmote): Emote =>
  ({
    min: 0,
    max: width.length - 1,
    id,
    code: name,
    toLink: (size: number): string => `https://cdn.7tv.app/emote/${id}/${size + 1}x`,
  });

const TwitchEmotesList: FC<TwitchEmotesListProps> = ({ setActiveEmote, token }) => {
  const { userId, username } = useSelector((root: RootState) => root.user);
  const [userEmotes, setUserEmotes] = useState<IEmotesList[]>();

  useEffect(() => {
    if (userId) {
      const get7TVEmotes = async () => sevenTVApi.fetchUserEmotes(username || '').then((emotes: any) => emotes.map(createSevenTVEmote)).catch(() => undefined)

      Promise.all([
        (async () => ({ id: 'Twitch_Global', collection: token ? await getTwitchGlobalEmotes(token) : undefined }))(),
        (async () => ({ id: '7TV', collection: await get7TVEmotes() }))(),
        (async () => ({ id: 'BTTV', collection: await fetcher.fetchBTTVEmotes(Number(userId)).catch(() => undefined) }))(),
        (async () => ({ id: 'FFZ', collection: await fetcher.fetchFFZEmotes(Number(userId)).catch(() => undefined) }))(),
      ])
        .then(setUserEmotes)
        .catch(() => setUserEmotes([]));
    }
  }, [userId, token, username]);

  const createEmoteList = useCallback(
    (emotes: IEmotesList) => {
      if (!emotes.collection) {
        return null;
      }

      return (
        <div className="emotes-group" key={emotes.id}>
          {Array.from<Emote>(emotes.collection.values()).map((emote) => {
            const { min = 0, max = 1 } = emote
            const handleClick = (): void => {
              setActiveEmote({ image: emote.toLink(max), code: emote.code });
            };
            const key = emote.id || emote.code

            return (
              <IconButton key={key} className="emote-button" onClick={handleClick}>
                <img alt="emote" src={emote.toLink(min)} />
              </IconButton>
            );
          })}
        </div>
      );
    },
    [setActiveEmote],
  );

  return (
    <div className="emotes-container">
      {userEmotes ? <>{userEmotes.map(createEmoteList)}</> : <CircularProgress className="emotes-loading" />}
    </div>
  );
};

export default TwitchEmotesList;
