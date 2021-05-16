import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import SkipState from '../SkipState/SkipState';
import RequestsList from '../RequestsList/RequestsList';
import './VideoPage.scss';
import { parseYoutubeUrl } from '../../utils/url.utils';
import { TwitchPubSubService, updateConnection } from '../../services/PubSubService';
import { Redemption, RedemptionMessage, RedemptionStatus } from '../../models/purchase';
import { VideoData, VideoRequest } from '../../models/video';
import { getRedemptions, updateRedemptionStatus } from '../../api/twitchApi';
import LoadingPage from '../LoadingPage/LoadingPage';
import { RootState } from '../../reducers';
import { loadUserData } from '../../reducers/AucSettings/AucSettings';
import history from '../../constants/history';
import ROUTES from '../../constants/routes.constants';
import { removeCoockie } from '../../utils/common.utils';

const YOUTUBE_API_KEY = 'AIzaSyCVPinFlGHMn0uzeWFjNTA38QOZBejOlSs';

const VideoPage: FC = () => {
  const dispatch = useDispatch();
  const { username, skipRewardId } = useSelector((root: RootState) => root.user);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [requestQueue, setRequestQueue] = useState<VideoRequest[]>([]);
  const currentVideo = useMemo(() => requestQueue[0] || null, [requestQueue]);

  const getVideoInfo = useCallback(async (id): Promise<VideoData> => {
    const { data } = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: { id, key: YOUTUBE_API_KEY, part: 'snippet,statistics,contentDetails' },
    });
    const { viewCount, likeCount, dislikeCount } = data.items[0].statistics;
    const { duration } = data.items[0].contentDetails;

    return {
      title: data.items[0].snippet.title,
      dislikeCount: Number(dislikeCount),
      likeCount: Number(likeCount),
      viewCount: Number(viewCount),
      duration: dayjs.duration(duration).asMilliseconds(),
    };
  }, []);

  const parseRedemption = useCallback(
    async ({ user, reward: { id: rewardId }, user_input, user_name, id }: Redemption): Promise<VideoRequest | null> => {
      const videoId = parseYoutubeUrl(user_input);
      const name = user ? user.display_name : user_name;

      if (videoId && rewardId === skipRewardId) {
        try {
          const videoData = await getVideoInfo(videoId);

          return { videoId, username: name, id, ...videoData };
        } catch (e) {
          console.warn(e);

          return null;
        }
      } else {
        return null;
      }
    },
    [getVideoInfo, skipRewardId],
  );

  const handleNewRequest = useCallback(
    async ({ redemption }: RedemptionMessage) => {
      const newRequest = await parseRedemption(redemption);

      if (newRequest) {
        setRequestQueue((requests) => [...requests, newRequest]);
      }
    },
    [parseRedemption],
  );

  const setConnection = useCallback(async () => {
    if (username) {
      const twitchPubSubService = new TwitchPubSubService(handleNewRequest);

      await updateConnection(twitchPubSubService, username);

      setIsLoading(false);
    }
  }, [handleNewRequest, username]);

  const redirectToLogin = useCallback(() => {
    history.push(ROUTES.LOGIN);
    removeCoockie('jwtToken');
  }, []);

  useEffect(() => {
    dispatch(loadUserData(redirectToLogin));
  }, [dispatch, redirectToLogin]);

  useEffect(() => {
    setConnection();
  }, [setConnection]);

  const handleLoadMore = useCallback(async () => {
    if (skipRewardId && username) {
      const redemptions = await getRedemptions(skipRewardId, username);
      const newRequests = (await Promise.all(redemptions.map(parseRedemption))).filter(
        (request) => request && !requestQueue.find(({ id }) => request.id === id),
      ) as VideoRequest[];

      setRequestQueue((requests) => [...newRequests, ...requests]);
    }
  }, [parseRedemption, requestQueue, skipRewardId, username]);

  const toNextVideo = useCallback(() => {
    setRequestQueue((requests) => {
      if (username) {
        updateRedemptionStatus(username, requests[0].id, RedemptionStatus.Fulfilled);
      }

      return requests.slice(1);
    });
  }, [username]);

  if (isLoading) {
    return <LoadingPage helpText="Загрузка... (пока что возможна долгая загрузка, в будущем оптимизирую это дело)" />;
  }

  return (
    <div className="page-container">
      <div className="video-container">
        <VideoPlayer id={currentVideo?.videoId} />
        <SkipState toNextVideo={toNextVideo} currentVideo={currentVideo} videos={requestQueue} />
      </div>
      <RequestsList requestQueue={requestQueue} onLoadMore={handleLoadMore} />
      <div className="extra">created by Kozjar</div>
    </div>
  );
};

export default VideoPage;
