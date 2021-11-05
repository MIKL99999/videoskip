import React, { FC, useState } from 'react';
import { Button, Typography } from '@material-ui/core';
import { useLocation } from 'react-router';
import { ReactComponent as TwitchSvg } from '../../assets/icons/twitch.svg';
import './LoginPage.scss';
import { LocationState } from '../../constants/history';

const commonScope = 'channel:read:redemptions channel:manage:redemptions';

const getAuthParams = (extraScope?: string) => ({
  client_id: '83xjs5k4yvqo0yn2cxu1v5lan2eeam',
  redirect_uri: `${window.location.origin}/twitch/redirect`,
  response_type: 'code',
  scope: extraScope ? `${commonScope} ${extraScope}` : commonScope,
  force_verify: 'true',
});

const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');

const LoginPage: FC = () => {
  const { state: { errorMessage } = {} } = useLocation<LocationState>();
  const [manageExtension] = useState<boolean>(true);
  const handleAuth = (): void => {
    const params = new URLSearchParams(getAuthParams(manageExtension ? 'user:edit:broadcast' : ''));
    authUrl.search = params.toString();

    window.open(authUrl.toString(), '_self');
  };

  return (
    <div className="login-page">
      <div className="login-page-content">
        <Button
          className="twitch-login-button"
          variant="contained"
          size="large"
          startIcon={<TwitchSvg className="base-icon" />}
          onClick={handleAuth}
        >
          Подключить twitch
        </Button>
        {errorMessage && <Typography className="login-page-error">{errorMessage}</Typography>}
      </div>
    </div>
  );
};

export default LoginPage;
