import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice'
import clusterReducer from './features/cluster/clusterSlice'
import registryReducer from './features/registry/registrySlice'
import usersReducer from './features/users/usersSlice'
import secretsReducer from './features/secret/secretSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    cluster: clusterReducer,
    registry: registryReducer,
    users: usersReducer,
    secrets: secretsReducer,
  },
})