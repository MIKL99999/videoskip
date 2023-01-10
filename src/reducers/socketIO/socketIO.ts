import {createSlice} from "@reduxjs/toolkit";
import {io, Socket} from "socket.io-client";
import {getSocketIOUrl} from "../../utils/url.utils";
import {getCookie} from "../../utils/common.utils";

interface SocketIOState {
  socket?: Socket;
}

const initialState: SocketIOState = {
  socket: undefined,
};

const socketIOSlice = createSlice({
  name: 'socketIO',
  initialState,
  reducers: {
    connectToSocketServer(state): void {
      const socket = io(getSocketIOUrl(), { auth: { token: getCookie('jwtToken') } })

      state.socket = socket as any
    }
  }
})

export const { connectToSocketServer } = socketIOSlice.actions

export default socketIOSlice.reducer