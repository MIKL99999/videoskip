import React from 'react';
import './App.scss';
import { createStyles, makeStyles, MuiThemeProvider } from '@material-ui/core/styles';
import { Route, Switch } from 'react-router-dom';
import ROUTES from '../../constants/routes.constants';
import { theme } from '../../constants/theme.constants';
import AlertsContainer from '../AlertsContainer/AlertsContainer';
import VideoPage from '../VideoPage/VideoPage';
import TwitchRedirect from '../TwitchRedirect/TwitchRedirect';
import LoginPage from '../LoginPage/LoginPage';
import PrivateRoute from '../PrivateRoute/PrivateRoute';
import { Redirect } from "react-router";

const drawerWidth = 240;

const useStyles = makeStyles(() =>
  createStyles({
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7) + 3,
    },
    content: {
      flexGrow: 1,
    },
    root: {
      background: theme.palette.background.default,
      color: theme.palette.text.primary,
      display: 'flex',
      fontFamily: theme.typography.fontFamily,
      fontWeight: 300,
      minHeight: '100vh',
    },
    menuIcon: {
      width: 26,
      height: 26,
      fill: '#fff',
    },
  }),
);

const App: React.FC = () => {
  const classes = useStyles();

  return (
    <MuiThemeProvider theme={theme}>
      <div className={classes.root}>
        <main className={classes.content}>
          <AlertsContainer />
          <Switch>
            <PrivateRoute exact path={ROUTES.VIDEO_SKIP}>
              <VideoPage />
            </PrivateRoute>
            <Route exact path={ROUTES.TWITCH_REDIRECT}>
              <TwitchRedirect />
            </Route>
            <Route exact path={ROUTES.LOGIN}>
              <LoginPage />
            </Route>
            <Route path='/'>
              <Redirect to={ROUTES.LOGIN} />
            </Route>
          </Switch>
        </main>
      </div>
    </MuiThemeProvider>
  );
};

export default App;
