import { createBrowserHistory } from 'history';

export interface LocationState {
  forcePush?: boolean;
  errorMessage?: string;
}

const history = createBrowserHistory<LocationState>();

export default history;
