import React, { FC, useCallback, useEffect, useState } from 'react';
import { CircularProgress, IconButton } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { RootState } from '../../reducers';
import './TwitchEmotesList..scss';
import { EmoteData } from '../../models/common.model';
// @ts-ignore
import { EmoteFetcher, Collection, Emote } from '@kozjar/twitch-emoticons';

const fetcher = new EmoteFetcher();

interface TwitchEmotesListProps {
  setActiveEmote: (emote: EmoteData) => void;
}

const TwitchEmotesList: FC<TwitchEmotesListProps> = ({ setActiveEmote }) => {
  const { userId } = useSelector((root: RootState) => root.user);
  const [userEmotes, setUserEmotes] = useState<(Collection<string, Emote> | undefined)[]>();

  useEffect(() => {
    if (userId) {
      Promise.all([
        fetcher.fetchTwitchEmotes(Number(userId)).catch(() => undefined),
        fetcher.fetchBTTVEmotes(Number(userId)).catch(() => undefined),
        fetcher.fetchFFZEmotes(Number(userId)).catch(() => undefined),
        fetcher.fetchTwitchEmotes().catch(() => undefined),
      ])
        .then(setUserEmotes)
        .catch(() => setUserEmotes([]));
    }
  }, [userId]);

  const createEmoteList = useCallback(
    (emotes?: Collection<string, Emote>) => {
      if (!emotes) {
        return null;
      }

      return (
        <div className="emotes-group">
          {Array.from<Emote>(emotes.values()).map((emote) => {
            const handleClick = (): void => {
              setActiveEmote({ image: emote.toLink(1), code: emote.code });
            };

            return (
              <IconButton key={emote.code} className="emote-button" onClick={handleClick}>
                <img alt="emote" src={emote.toLink(0)} />
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
