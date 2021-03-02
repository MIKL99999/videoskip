import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import SkipState from '../SkipState/SkipState';
import RequestsList from '../RequestsList/RequestsList';
import './VideoPage.scss';
import { parseYoutubeUrl } from '../../utils/url.utils';
import { useParams } from 'react-router';
import { TwitchPubSubService, updateConnection } from '../../services/PubSubService';
import { RedemptionMessage } from '../../models/purchase';
import { VideoData, VideoRequest } from '../../models/video';
import axios from 'axios';

const YOUTUBE_API_KEY = 'AIzaSyCVPinFlGHMn0uzeWFjNTA38QOZBejOlSs';

const VideoPage: FC = () => {
  const { username } = useParams();
  const [requestQueue, setRequestQueue] = useState<VideoRequest[]>([]);
  const currentVideo = useMemo(() => requestQueue[0] || null, [requestQueue]);

  const getVideoInfo = useCallback(async (id = 'vRVEZq8plc0'): Promise<VideoData> => {
    const { data } = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: { id, key: YOUTUBE_API_KEY, part: 'snippet' },
    });

    return { title: data.items[0].snippet.title };
  }, []);

  const handleNewRequest = useCallback(
    async ({ redemption }: RedemptionMessage) => {
      const {
        user: { display_name },
        reward: { id },
        user_input,
      } = redemption;
      const videoId = parseYoutubeUrl(user_input);

      console.log(videoId);
      console.log(id);

      if (videoId && id === '5d95f900-576b-4ef7-bd12-0b12e5b497e4') {
        const videoData = await getVideoInfo(videoId);

        setRequestQueue((requests) => [...requests, { videoId, username: display_name, ...videoData }]);
      }
    },
    [getVideoInfo],
  );

  useEffect(() => {
    const twitchPubSubService = new TwitchPubSubService(handleNewRequest);

    updateConnection(twitchPubSubService, username);
  }, [getVideoInfo, handleNewRequest, username]);

  const toNextVideo = useCallback(() => {
    setRequestQueue((requests) => requests.slice(1));
  }, []);

  return (
    <div className="page-container">
      <div className="video-container">
        <VideoPlayer id={currentVideo?.videoId} />
        <SkipState toNextVideo={toNextVideo} />
      </div>
      <RequestsList requestQueue={requestQueue} />
    </div>
  );
};

export default VideoPage;