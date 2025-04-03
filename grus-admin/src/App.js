import { Typography } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import AppContainer from './components/AppContainer';
import Login from './components/Login';
import PodsScreen from './components/pod/PodsScreen';
import ProtectedRoute from './components/common/ProtectedRouter';
import { SnackbarProvider } from 'notistack';
import CheckpointsScreen from './components/checkpoint/Checkpoints';
import { useSelector } from 'react-redux';
import RegistryScreen from './components/registry/Registry';
import SecretsScreen from './components/secret/Secrets';
import UserScreen from './components/user/UserScreen';
import ClusterScreen from './components/cluster/ClusterScreen';
const App = () => {
  const { kubeAuthenticated = false, authenticated = false } = useSelector(state => state.auth)

  return (
    <SnackbarProvider>
      <Router>
        <AppContainer>
          <Routes>
            <Route path='/' element={authenticated? <ClusterScreen /> : <Login />} />
            <Route path='/pods' element={<ProtectedRoute element={<PodsScreen />} />} />
            <Route path='/checkpoints' element={<ProtectedRoute element={<CheckpointsScreen />} />} />
            <Route path='/registry' element={<ProtectedRoute element={<RegistryScreen />} />} />
            <Route path='/secrets' element={<ProtectedRoute element={<SecretsScreen />} />} />
            <Route path='/users' element={<ProtectedRoute element={<UserScreen />} />} />
          </Routes>
        </AppContainer>
      </Router>
    </SnackbarProvider>
  );
}

export default App;
