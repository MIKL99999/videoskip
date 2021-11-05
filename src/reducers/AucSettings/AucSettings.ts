import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import mergewith from 'lodash.mergewith';
import { getUserData } from '../../api/userApi';
import { setSkipRewardId, setUserId, setUsername } from '../User/User';

export interface SettingFields {
  startTime?: number;
  timeStep?: number;
  isAutoincrementActive?: boolean;
  autoincrementTime?: number;
  isBuyoutVisible?: boolean;
  background: string | null;
  purchaseSort?: number;
  marblesAuc?: boolean;
  marbleRate?: number;
  marbleCategory?: number;
  showChances?: boolean;
}

export interface RewardSetting {
  cost?: number;
  color?: string;
}

export interface TwitchIntegration {
  isRefundAvailable: boolean;
  dynamicRewards: boolean;
  rewardsPrefix: string;
  rewards: RewardSetting[];
}

export interface DaIntegration {
  pointsRate: number;
  isIncrementActive: boolean;
  incrementTime: number;
}

export interface IntegrationFields {
  twitch: TwitchIntegration;
  da: DaIntegration;
}

interface AucSettingsState {
  settings: SettingFields;
  integration: IntegrationFields;
}

export const initialState: AucSettingsState = {
  settings: {
    startTime: 10,
    isBuyoutVisible: true,
    timeStep: 60,
    isAutoincrementActive: false,
    autoincrementTime: 30,
    purchaseSort: 0,
    background: null,
    marblesAuc: false,
    marbleRate: 50,
    marbleCategory: 100,
    showChances: false,
  },
  integration: {
    twitch: {
      isRefundAvailable: false,
      dynamicRewards: false,
      rewardsPrefix: 'ставка',
      rewards: [],
    },
    da: {
      pointsRate: 100,
      isIncrementActive: false,
      incrementTime: 30,
    },
  },
};

const mergeCheck = <T>(obj: T, src: T): T => (src === undefined ? obj : src);

const aucSettingsSlice = createSlice({
  name: 'aucSettings',
  initialState,
  reducers: {
    setAucSettings(state, action: PayloadAction<SettingFields>): void {
      state.settings = mergewith(state.settings, action.payload, mergeCheck);
    },
    setIntegration(state, action: PayloadAction<IntegrationFields>): void {
      state.integration.da = mergewith(state.integration.da, action.payload.da, mergeCheck);
      state.integration.twitch = mergewith(state.integration.twitch, action.payload.twitch, mergeCheck);
    },
  },
});

export const { setAucSettings, setIntegration } = aucSettingsSlice.actions;

export const loadUserData =
  (handleError: (status: string) => void) =>
  async (dispatch: ThunkDispatch<{}, {}, Action>): Promise<void> => {
    try {
      const { username, userId, skipRewardId } = await getUserData();

      dispatch(setUsername(username));
      dispatch(setUserId(userId));
      dispatch(setSkipRewardId(skipRewardId));
    } catch (e) {
      handleError(e.response?.data?.message);
    }
  };

export default aucSettingsSlice.reducer;
