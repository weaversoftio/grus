import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { clusterApi } from '../../api/clusterApi';

const getList = createAsyncThunk(
  `cluster/list`,
  async (_, thunkApi) => {
    return await clusterApi.getList()
      .then(response => {
        return response;
      })
      .catch(err => {
        // console.log(err)
        return thunkApi.rejectWithValue(err.message || err);
      });
  }
)

const login = createAsyncThunk(
  `cluster/login`,
  async (data, thunkApi) => {
    return await clusterApi.login(data?.name)
      .then(response => {
        return { cluster: data, ...response };
      })
      .catch(err => {
        // console.log(err)
        return thunkApi.rejectWithValue(err.message || err);
      });
  }
)
const create = createAsyncThunk(
  `cluster/create`,
  async (data, thunkApi) => {
    return await clusterApi.create(data)
      .then(response => {
        return response;
      })
      .catch(err => {
        // console.log(err)
        return thunkApi.rejectWithValue(err.message || err);
      });
  }
)

const remove = createAsyncThunk(
  `cluster/delete`,
  async (name, thunkApi) => {
    return await clusterApi.remove(name)
      .then(response => {
        return response;
      })
      .catch(err => {
        // console.log(err)
        return thunkApi.rejectWithValue(err.message || err);
      });
  }
)

const verify = createAsyncThunk(
  `cluster/verify`,
  async (name, thunkApi) => {
    return await clusterApi.verify(name)
      .then(response => {
        return response;
      })
      .catch(err => {
        // console.log(err)
        return thunkApi.rejectWithValue(err.message || err);
      });
  }
)

const enableCheckpointing = createAsyncThunk(
  `cluster/enableCheckpointing`,
  async (data, thunkApi) => {
    return await clusterApi.enableCheckpointing(data)
      .then(response => {
        return response;
      })
      .catch(err => {
        // console.log(err)
        return thunkApi.rejectWithValue(err.message || err);
      });
  }
)

const installRunC = createAsyncThunk(
  `cluster/installRunC`,
  async (name, thunkApi) => {
    return await clusterApi.installRunC(name)
      .then(response => {
        return response;
      })
      .catch(err => {
        // console.log(err)
        return thunkApi.rejectWithValue(err.message || err);
      });
  }
)


const initialState = {
  kubeAuthenticated: false,
  selectedCluster: "",
  checkpointingEnabled: null,
  loading: {
    list: false,
    login: false,
    verification: false,
    checkpointing: false,
    enableCheckpointing: false,
    installRunC: false
  },
  list: [],
  message: "",
  error: ""
}
export const clusterSlice = createSlice({
  name: 'cluster',
  initialState,
  reducers: {
    setSelectedCluster: (state, action) => {
      state.checkpointingEnabled = false
      state.selectedCluster = action.payload || null
      return state
    },
    clearState: (state, action) => {
      state = initialState
      return state
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getList.pending, (state, action) => {
        state.message = ""
        state.loading.list = true
        return state
      })
      .addCase(getList.fulfilled, (state, action) => {
        const { message = "", cluster_configs = [] } = action.payload || {};
        // console.log("getList.fulfilled", action.payload)
        state.message = message
        state.list = cluster_configs
        state.loading.list = false
        return state
      })
      .addCase(getList.rejected, (state, action) => {
        console.log("cluster getlist rejected", action.payload)
        state.message = ""
        state.error = action.payload.toString();
        state.loading.list = false
        return state
      })
      .addCase(login.pending, (state, action) => {
        state.kubeAuthenticated = false
        state.checkpointingEnabled = null
        state.loading.login = true
        return state
      })
      .addCase(login.fulfilled, (state, action) => {
        const { success = false, message = "" } = action.payload || {};
        console.log("login.fulfilled", action.payload)
        state.kubeAuthenticated = success
        state.loading.login = false
        if (!success) state.error = message
        return state
      })
      .addCase(login.rejected, (state, action) => {
        console.log("cluster login rejected", action.payload)
        state.kubeAuthenticated = false
        state.error = action.payload.toString();
        state.loading.login = false
        return state
      })
      .addCase(verify.pending, (state, action) => {
        state.verificationError = ""
        state.loading.verification = true
        return state
      })
      .addCase(verify.fulfilled, (state, action) => {
        const { success = false, message = "" } = action.payload || {};
        // console.log("cluster verify fulfilled", action.payload)
        state.message = message
        state.checkpointingEnabled = success
        state.verificationError = ""
        state.loading.verification = false
        return state
      })
      .addCase(verify.rejected, (state, action) => {
        const { success = false, message = "" } = action.payload || {};
        console.log("cluster verify rejected", action.payload)
        state.message = message
        state.checkpointingEnabled = success
        state.verificationError = action.payload.toString();
        state.loading.verification = false
        return state
      })

      .addCase(enableCheckpointing.pending, (state, action) => {
        state.loading.enableCheckpointing = true
        return state
      })
      .addCase(enableCheckpointing.fulfilled, (state, action) => {
        const { success = false, message = "" } = action.payload || {};
        // console.log("cluster enableCheckpointing fulfilled", action.payload)
        state.message = message
        state.checkpointingEnabled = success
        state.loading.enableCheckpointing = false
        return state
      })
      .addCase(enableCheckpointing.rejected, (state, action) => {
        const { success = false, message = "" } = action.payload || {};
        console.log("cluster enableCheckpointing rejected", action.payload)
        state.message = message
        state.checkpointingEnabled = success
        state.error = action.payload.toString();
        state.loading.enableCheckpointing = false
        return state
      })
      
      .addCase(installRunC.pending, (state, action) => {
        state.loading.installRunC = true
        return state
      })
      .addCase(installRunC.fulfilled, (state, action) => {
        const { message = "" } = action.payload || {};
        // console.log("cluster installRunC fulfilled", action.payload)
        state.message = message
        state.loading.installRunC = false
        return state
      })
      .addCase(installRunC.rejected, (state, action) => {
        const { message = "" } = action.payload || {};
        console.log("cluster installRunC rejected", action.payload)
        state.message = message
        state.error = action.payload.toString();
        state.loading.installRunC = false
        return state
      })


  }
})

export const clusterActions = { ...clusterSlice.actions, getList, create, remove, login, verify, enableCheckpointing, installRunC }

export default clusterSlice.reducer