import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import './SkipState.scss';
import { Button, Input, LinearProgress } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { SkipBotService } from '../../services/SkipBotService';
import { VideoRequest } from '../../models/video';
import EmoteSelect from '../EmoteSelect/EmoteSelect';
import { EmoteData, SkipEmotes } from '../../models/common.model';
import { getSkipEmotes, updateSkipEmotes } from '../../api/userApi';
import { RootState } from '../../reducers';
import PlayerActions from '../PlayerActions/PlayerActions';

interface SkipStateProps {
  toNextVideo: () => void;
  currentVideo?: VideoRequest;
  videos: VideoRequest[];
}

const SkipState: FC<SkipStateProps> = ({ toNextVideo, currentVideo, videos }) => {
  const { username } = useSelector((root: RootState) => root.user);
  const [skips, setSkips] = useState<number>(0);
  const [maxSkips, setMaxSkips] = useState<number>(7);
  const [skipService, setSkipService] = useState<SkipBotService>();
  const [skipEmotes, setSkipEmotes] = useState<SkipEmotes>({});
  const skipsDisplay = useMemo(() => {
    if (skips < 0) {
      return 0;
    }

    return skips;
  }, [skips]);

  useEffect(() => {
    if (username) {
      const skipServiceInstance = new SkipBotService(username);

      skipServiceInstance.setSkipCount = setSkips;

      setSkipService(skipServiceInstance);
    }
  }, [username]);

  const loadEmotes = useCallback(async () => {
    const emotes = username && (await getSkipEmotes(username));

    if (emotes) {
      setSkipEmotes(emotes);
    }
  }, [username]);

  useEffect(() => {
    loadEmotes();
  }, [loadEmotes]);

  useEffect(() => {
    if (skipService) {
      skipService.ignoreUser = currentVideo?.username;
      skipService.videoId = currentVideo?.videoId;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo?.username, currentVideo?.videoId]);

  useEffect(() => {
    if (skipService) {
      skipService.videos = videos;
    }
  }, [skipService, videos]);

  const skipVideo = useCallback(() => {
    if (skipService) {
      skipService.resetSkips();
    }
    toNextVideo();
  }, [skipService, toNextVideo]);

  const handleMaxSkipsChange = useCallback((e: any) => {
    setMaxSkips(Number(e.target.value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = useMemo(() => (skipsDisplay >= maxSkips ? 100 : (skipsDisplay / maxSkips) * 100), [
    maxSkips,
    skipsDisplay,
  ]);

  const currentColor = useMemo(() => (skipsDisplay >= maxSkips ? 'secondary' : 'primary'), [maxSkips, skipsDisplay]);

  useEffect(() => {
    if (skipService) {
      if (skipEmotes.skip) {
        skipService.skipCommand = skipEmotes.skip.code;
      }

      if (skipEmotes.safe) {
        skipService.safeCommand = skipEmotes.safe.code;
      }
    }
  }, [skipEmotes, skipEmotes.safe, skipEmotes.skip, skipService, username]);

  const handleSkipEmoteChange = useCallback(
    (skip: EmoteData): void => {
      setSkipEmotes((emotes) => {
        updateSkipEmotes(username || '', { ...emotes, skip });

        return { ...emotes, skip };
      });
    },
    [username],
  );
  const handleSafeEmoteChange = useCallback(
    (safe: EmoteData): void => {
      setSkipEmotes((emotes) => {
        updateSkipEmotes(username || '', { ...emotes, safe });

        return { ...emotes, safe };
      });
    },
    [username],
  );

  return (
    <div className="skip-container">
      <EmoteSelect title="сейв" setEmote={handleSafeEmoteChange} defaultEmote={skipEmotes.safe} />
      <div className="skip-slice-container">
        <LinearProgress className="skip-progress" variant="determinate" value={progress} color={currentColor} />
        <div className="skips-count">
          <span>{`${skips} / `}</span>
          <Input className="max-skips-input" onBlur={handleMaxSkipsChange} defaultValue={maxSkips} />
        </div>
      </div>
      <EmoteSelect title="скип" setEmote={handleSkipEmoteChange} defaultEmote={skipEmotes.skip} />
      <Button variant="contained" color={currentColor} onClick={skipVideo} className="skip-button">
        Скип
      </Button>
      <div className="player-actions">
        <PlayerActions />
      </div>
    </div>
  );
};

export default SkipState;
