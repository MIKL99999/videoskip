import React, { FC } from 'react';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import { VideoData } from '../../models/video';
import './VideoStats.scss';

interface VideoStatsProps {
  video: VideoData;
}

const VideoStats: FC<VideoStatsProps> = ({ video: { viewCount, likeCount, dislikeCount } }) => {
  return (
    <div className="video-stats">
      <VisibilityIcon />
      <div>{viewCount}</div>
      <ThumbUpIcon className="likes-icon" />
      <div>{likeCount}</div>
    </div>
  );
};

export default VideoStats;
