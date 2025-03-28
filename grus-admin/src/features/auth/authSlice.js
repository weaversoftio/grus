import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { removeCookie, setCookie } from '../../utils/cookies'
import { kubectlApi } from '../../api/kubeApi';
import { registryApi } from '../../api/registryLogin';
import { userApi } from '../../api/userApi';

const kubeLogin = createAsyncThunk(
  `kubectl/login`,
  async (data, thunkApi) => {
    return await kubectlApi.login({cluster_config_name: data?.name})
      .then(response => {
        return { cluster: data, ...response };
      })
      .catch(err => {
        // console.log(err)
        return thunkApi.rejectWithValue(err.message || err);
      });
  }
)

const registryLogin = createAsyncThunk(
  `registry/login`,
  async (data, thunkApi) => {
    return await registryApi.login(data)
      .then(response => {
        return { ...response, username: data?.username };
      })
      .catch(err => {
        // console.log(err)
        return thunkApi.rejectWithValue(err.message || err);
      });
  }
)

const userLogin = createAsyncThunk(
  `user/login`,
  async (data, thunkApi) => {
    return await userApi.login(data)
      .then(response => {
        setCookie("token", response?.data?.token)
        return { ...response?.data };
      })
      .catch(err => {
        // console.log(err)
        return thunkApi.rejectWithValue(err.message || err);
      });
  }
) 

const verifyUser = createAsyncThunk(
  `user/verify`,
  async (_, thunkApi) => {
    return await userApi.verify()
      .then(response => {
        return { ...response?.data };
      })
      .catch(err => {
        // console.log(err)
        return thunkApi.rejectWithValue(err.message || err);
      });
  }
)

const initialState = {
  authenticated: false,
  kubeApi: "",
  kubeAuthenticated: false,
  kubeMessage: "",
  kubeError: "",
  registryUsername: "",
  registryAuthenticated: false,
  loading: false,
  user: null
}
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state, action) => {
      state = initialState
      removeCookie("token")
      return state
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLogin.pending, (state, action) => {
        state.loading = true;
        return state
      })
      .addCase(userLogin.rejected, (state, action) => {
        const { success = false, message = "" } = action.payload || {};
        state.authenticated = false;
        state.loading = false;
        state.error = action.payload.toString();
        return state
      })
      .addCase(userLogin.fulfilled, (state, action) => {  
        const { success = false, message = "", user = "" } = action.payload || {};
        state.authenticated = success;
        state.error = !success && message;
        state.user = user;
        state.loading = false;
        return state
      })
      .addCase(verifyUser.rejected, (state, action) => {
        const { success = false, message = "" } = action.payload || {};
        state.authenticated = false;
        return state
      })  
      .addCase(verifyUser.fulfilled, (state, action) => {
        const { success = false, message = "", user = "" } = action.payload || {};
        state.authenticated = success;
        state.error = "";
        state.user = user;
        return state
      })
      .addCase(kubeLogin.pending, (state, action) => {
        state.loading = true;
        return state
      })
      .addCase(kubeLogin.rejected, (state, action) => {
        const { success = false, message = "" } = action.payload || {};
        console.log("kubeLogin failed", action.payload)
        state.kubeAuthenticated = success;
        state.kubeError = action.payload.toString();
        state.loading = false;
        return state
      })
      .addCase(kubeLogin.fulfilled, (state, action) => {
        const { success = false, message = "", cluster_config_details = null } = action.payload || {};
        // console.log("kubeLogin.fulfilled", action.payload)
        state.kubeApi = cluster_config_details?.kube_api_url
        state.kubeAuthenticated = success;
        state.kubeMessage = message;
        state.kubeError = ""
        state.loading = false;
        return state
      })
      .addCase(registryLogin.rejected, (state, action) => {
        console.error("Registry login failed", action.payload)
        state.registryAuthenticated = false;
        state.registryUsername = ""
        return state
      })
      .addCase(registryLogin.fulfilled, (state, action) => {
        const { message = "", username = "" } = action.payload || {};
        console.log("registryLogin.fulfilled", action.payload)
        state.registryAuthenticated = !!message;
        state.registryUsername = username
        return state
      })
  }
})

export const authActions = { ...authSlice.actions, kubeLogin, registryLogin, userLogin, verifyUser }

export default authSlice.reducer