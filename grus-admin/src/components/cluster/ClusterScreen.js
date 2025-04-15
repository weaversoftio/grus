import { Box, Typography, Button, Select, MenuItem, FormControl, TextField, Stack, Grid2 as Grid, Card, CardContent, CircularProgress, Paper, Divider, Chip, IconButton, Tooltip } from "@mui/material"
import { useDispatch, useSelector } from "react-redux";
import { Loading } from "../common/loading";
import { clusterActions } from "../../features/cluster/clusterSlice";
import { useEffect, useState } from "react";
import DialogComponent from "../common/Dialog";
import { useSnackbar } from "notistack";
import { clusterApi } from "../../api/clusterApi";
import { useNavigate } from "react-router-dom";
import { Delete, SystemUpdateAlt as InstallIcon, SafetyCheck as VerifyIcon, Add as AddIcon, Cloud as CloudIcon, Storage as StorageIcon, Security as SecurityIcon, CloudUpload, Edit } from "@mui/icons-material";
import { removeCookie } from "../../utils/cookies";
import PolylineIcon from '@mui/icons-material/Polyline';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { CustomerContainer } from "../common/CustomContainer";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WarningIcon from '@mui/icons-material/Warning';
import { YamlEditor } from "../common/YamlViewer";
import Editor from "@monaco-editor/react";

const ClusterScreen = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate()

  const dispatch = useDispatch()
  const {
    kubeAuthenticated = false,
    error: clusterError = "",
    checkpointingEnabled = false,
    selectedCluster = "",
    loading = {}
  } = useSelector(state => state.cluster)

  const { loading: authLoading = false } = useSelector(state => state.auth)

  const [clusterType, setClusterType] = useState("openshift")
  const [clusterEditing, setClusterEditing] = useState(false)
  const [dialogType, setDialogType] = useState("")
  const [dialogData, setDialogData] = useState(null)
  const [clusterName, setClusterName] = useState("");
  const [clusterUrl, setClusterUrl] = useState("");
  const [clusterUsername, setClusterUsername] = useState("");
  const [clusterPassword, setClusterPassword] = useState("");
  const [clusterConfirmPassword, setClusterConfirmPassword] = useState("");
  const [nodesUsername, setNodesUsername] = useState("");
  const [sshKey, setSshkey] = useState(null);
  const [clusterFormErrors, setClusterFormErrors] = useState({});
  const [statLoading, setStatLoading] = useState(false)
  const [stats, setStats] = useState({ total_pods: 0, total_checkpoints: 0 });
  const [playbookConfigs, setPlaybookConfigs] = useState([])

  const isCheckpointEnabled = kubeAuthenticated && checkpointingEnabled

  useEffect(() => {
    const fetchStats = async () => {
      if (!kubeAuthenticated) return setStats({ total_pods: 0, total_checkpoints: 0 })
      setStatLoading(true)
      try {
        const data = await clusterApi.getStatistics();
        setStats(data);
      } catch (error) {
        enqueueSnackbar("Failed to get statistics", { variant: "error" })
      }

      setStatLoading(false)
    };

    fetchStats();
  }, [kubeAuthenticated]);

  const handleSubmitCluster = async () => {
    const clusterData = {
      name: clusterName,
      kube_api_url: clusterUrl,
      kube_username: clusterUsername,
      kube_password: clusterPassword,
      nodes_username: nodesUsername,
    }
    if (clusterPassword !== clusterConfirmPassword) return setClusterFormErrors({ confirmPassword: "Password mismatch" })

    if (clusterEditing) {
      enqueueSnackbar("Update cluster initiated...", { variant: "info" })
      await clusterApi.update(clusterData)
    } else {
      enqueueSnackbar("Creating cluster initiated...", { variant: "info" })
      await clusterApi.create(clusterData)
    }

    if (sshKey) {
      const formData = new FormData()
      formData.append("file", sshKey)
      await clusterApi.uploadSshkey(clusterName, formData)
      handleClearDialog()
      dispatch(clusterActions.getList())
    }
    enqueueSnackbar(`Cluster ${clusterEditing? "updated":"added"} successfully`, { variant: "success" })
  }

  const handleShowClusterConfig = () => {
    const { name, cluster_config_details } = selectedCluster || {}
    const { kube_api_url, kube_username, nodes_username } = cluster_config_details || {}
    setClusterEditing(true)
    setClusterName(name)
    setClusterUrl(kube_api_url)
    setClusterUsername(kube_username)
    setNodesUsername(nodes_username)
    setDialogType("clusterForm")
  }

  const handleDeleteCluster = async () => {
    try {
      await clusterApi.remove(selectedCluster.name)
      removeCookie("selectedCluster")
      dispatch(clusterActions.clearState())
      dispatch(clusterActions.getList())
      enqueueSnackbar(`Cluster: ${selectedCluster.name} successfully deleted`, { variant: "success" })
    } catch (error) {
      console.error("Cluster delete error", error.toString())
      enqueueSnackbar(`Cluster: ${selectedCluster.name} deletion failed`, { variant: "error" })
    }
    setDialogType("")
  }

  const handleClusterVerification = async () => {
    enqueueSnackbar("Cluster verification started", { variant: "info" })
    const { payload = null } = await dispatch(clusterActions.verify(selectedCluster.name))
    const { success = false } = payload || {}
    if (!success) {
      enqueueSnackbar("Cluster verification failed", { variant: "error" })
      return
    }
    enqueueSnackbar("Cluster verification successful", { variant: "success" })
  }

  const handleEnableCheckpointing = async (clusterType) => {
    enqueueSnackbar("Enable checkpointing started", { variant: "info" })
    setDialogType("")
    const { payload = null } = await dispatch(clusterActions.enableCheckpointing({ clusterType, clusterName: selectedCluster.name }))
    const { success = false } = payload || {}
    if (!success) {
      enqueueSnackbar("Enable checkpointing failed", { variant: "error" })
    } else {
      enqueueSnackbar("Enable checkpointing successful", { variant: "success" })
    }
  }

  const handleInstallRunc = async () => {
    try {
      enqueueSnackbar("Installing runc", { variant: "info" })
      const result = await dispatch(clusterActions.installRunC(selectedCluster.name))
      if (!result?.success) {
        enqueueSnackbar(`Failed to install runc`, { variant: "error" })
        return
      }
      enqueueSnackbar("RunC installation successful", { variant: "success" })
    } catch (error) {
      console.error("Failed to install runc", error)
      enqueueSnackbar("Failed to install runc", { variant: "error" })
    }
  }

  const handleShowNodeConfig = async () => {
    const { success = false, message = "", cluster_config = null } = await clusterApi.getNodeConfig(selectedCluster.name)
    if (!success) {
      enqueueSnackbar(`Node configuration failed, ${message}`, { variant: "error" })
    } else {
      setDialogType("nodeConfig")
      setDialogData(cluster_config)
    }
  }

  const handlePlaybookConfigs = async () => {
    setDialogType("playbookConfigs")
    setDialogData({ loading: true })

    const result = await clusterApi.getPlaybookConfigs()
    if (!result?.success) {
      enqueueSnackbar(`Failed to get playbook configs`, { variant: "error" })
      return
    }
    setDialogData(null)
    setPlaybookConfigs(result?.config_list)
  }

  const handleEnableCheckpointingConfirmation = (type) => {
    setDialogType("confirmEnableCheckpoint")
    setDialogData(type)
  }

  const handleUpdateNodeConfig = async () => {
    enqueueSnackbar("Updating node configuration started", { variant: "info" })
    const { success = false, message = "" } = await clusterApi.updateNodeConfig(selectedCluster.name, dialogData)
    if (!success) {
      enqueueSnackbar(`Node configuration update failed, ${message}`, { variant: "error" })
    } else {
      enqueueSnackbar("Node configuration update successful", { variant: "success" })
    }
    setDialogType("")
  }

  const handleUpdatePlaybookConfig = async () => {
    enqueueSnackbar("Updating playbook configuration started", { variant: "info" })
    const { success = false, message = "" } = await clusterApi.updatePlaybookConfig(dialogData)
    if (!success) {
      enqueueSnackbar(`Playbook configuration update failed, ${message}`, { variant: "error" })
    } else {
      enqueueSnackbar("Playbook configuration update successful", { variant: "success" })
    }
    setDialogType("")
  }

  const handleShowYaml = async (yaml) => {
    setDialogType("playbookConfigEditor")
    setDialogData(yaml)
  }

  const handleClearDialog = () => {
    setDialogType("")
    setClusterName("")
    setClusterUrl("")
    setClusterUsername("")
    setClusterPassword("")
    setClusterConfirmPassword("")
    setSshkey(null)
    setClusterFormErrors(null)
  }

  const renderClusterForm = () => {
    return (
      <DialogComponent
        open
        onClose={handleClearDialog}
        paperProps={{
          maxWidth: 500,
          sx: { borderRadius: 2 }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Cluster Configuration
          </Typography>
        </Box>
        <Box gap={2} display={"flex"} flexDirection={"column"}>
          <TextField
            label="Cluster Name"
            onChange={(e) => setClusterName(e.target.value)}
            value={clusterName}
            disabled={clusterEditing}
          />
          <TextField
            label="Cluster Api Url"
            onChange={(e) => setClusterUrl(e.target.value)}
            value={clusterUrl}
          />

          <TextField
            label="Cluster Username"
            onChange={(e) => setClusterUsername(e.target.value)}
            value={clusterUsername}
          />
          <TextField
            label="Password"
            type={"password"}
            onChange={(e) => setClusterPassword(e.target.value)}
            value={clusterPassword}
          />
          <TextField
            label="Confirm Password"
            type={"password"}
            onChange={(e) => setClusterConfirmPassword(e.target.value)}
            value={clusterConfirmPassword}
            error={clusterFormErrors?.confirmPassword}
            helperText={clusterFormErrors?.confirmPassword}
          />
          <Button variant="outlined" component="label" style={{ width: 200, textTransform: "capitalize" }} startIcon={<CloudUpload />}>
            Upload SSH Key
            <input
              type="file"
              accept="*"
              hidden
              onChange={(e) => setSshkey(e.target.files[0])}
            />
          </Button>
          {sshKey && <Typography variant="body2">{sshKey.name}</Typography>}
          <TextField
            label="Nodes Username"
            onChange={(e) => setNodesUsername(e.target.value)}
            value={nodesUsername}
          />
          <Button variant="contained" style={{ textTransform: "capitalize" }} onClick={handleSubmitCluster}>Submit</Button>
        </Box>
      </DialogComponent>
    )
  }

  const renderSelectClusterType = () => {
    return (
      <DialogComponent
        open
        onClose={handleClearDialog}
        paperProps={{
          maxWidth: 500,
          sx: { borderRadius: 2 }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Select Cluster Type To Enable
          </Typography>
          <Box sx={{ display: 'flex', gap: 5, justifyContent: 'center', mt: 3 }}>
            <Button variant="outlined" onClick={() => handleEnableCheckpointingConfirmation("openshift")} style={{ height: 50 }}>Openshift</Button>
            <Button variant="outlined" onClick={() => handleEnableCheckpointingConfirmation("kubernetes")}>Kubernetes</Button>
          </Box>
        </Box>
      </DialogComponent>
    )
  }

  const renderDeleteClusterDialog = () => {
    return (
      <DialogComponent
        open={!!dialogType}
        onClose={handleClearDialog}
        paperProps={{
          maxWidth: 500,
          sx: { borderRadius: 2 }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            Delete Cluster
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Are you sure you want to delete the cluster "{selectedCluster.name}"? This action cannot be undone.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => setDialogType("")}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteCluster}
              sx={{ textTransform: 'none' }}
            >
              Delete Cluster
            </Button>
          </Box>
        </Box>
      </DialogComponent>
    )
  }

  const renderConfirmEnableCheckpoint = () => {
    return (
      <DialogComponent
        open={!!dialogType}
        onClose={handleClearDialog}
        paperProps={{
          maxWidth: 500,
          sx: { borderRadius: 2 }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            <WarningIcon color="warning" sx={{ verticalAlign: 'middle', mr: 1, mt: -.5 }} />
            Enabling Checkpointing
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Warning: Enabling checkpointing will require a restart of the cluster. Are you sure you want to proceed?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => setDialogType("")}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => handleEnableCheckpointing(dialogData)}
              sx={{ textTransform: 'none' }}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </DialogComponent>
    )
  }

  const renderJsonEditorDialog = () => {
    return (
      <DialogComponent
        open={!!dialogType}
        onClose={handleClearDialog}
        paperProps={{
          maxWidth: 800,
          sx: { borderRadius: 2 }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            JSON Editor
          </Typography>
          <Box sx={{ height: '400px', border: '1px solid #ccc', borderRadius: '4px' }}>
            <Editor
              height="100%"
              defaultLanguage="json"
              value={JSON.stringify(dialogData, null, 2)}
              onChange={(value) => {
                try {
                  const parsed = JSON.parse(value);
                  setDialogData(parsed);
                } catch (e) {
                  // Invalid JSON, don't update
                }
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClearDialog}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateNodeConfig}
              sx={{ textTransform: 'none' }}
            >
              Update Configuration
            </Button>
          </Box>
        </Box>
      </DialogComponent>
    );
  };

  const renderPlaybookConfigsDialog = () => {
    return (
      <DialogComponent
        open={!!dialogType}
        onClose={handleClearDialog}
        paperProps={{
          maxWidth: 500,
          sx: { borderRadius: 2 }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            Playbook Configurations
          </Typography>
          {dialogData?.loading ? <Loading text={"Loading playbook configurations"} /> :
            (
              playbookConfigs?.map((item, index) => (
                <Box>
                  <Button variant="text" sx={{ textTransform: "none" }} onClick={() => handleShowYaml(item)}>{item.name}</Button>
                </Box>
              )
              )
            )}
        </Box>
      </DialogComponent>
    )
  }

  const renderPlaybookConfigEditorDialog = () => {
    return (
      <DialogComponent
        open={!!dialogType}
        onClose={handleClearDialog}
        paperProps={{
          maxWidth: 700,
          sx: { borderRadius: 2 }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: "primary.main" }}>
            {dialogData?.name}
          </Typography>
          <YamlEditor initialYaml={dialogData?.data} onYamlChange={(yaml) => {
            setDialogData((prev) => ({ ...prev, data: yaml }))
          }} />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClearDialog}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdatePlaybookConfig}
              sx={{ textTransform: 'none' }}
            >
              Update
            </Button>
          </Box>
        </Box>
      </DialogComponent>
    )
  }

  const renderDialog = () => {
    if (!dialogType) return

    const dialogComponent = {
      clusterForm: renderClusterForm,
      enableCheckpoint: renderSelectClusterType,
      confirmEnableCheckpoint: renderConfirmEnableCheckpoint,
      deleteCluster: renderDeleteClusterDialog,
      nodeConfig: renderJsonEditorDialog,
      playbookConfigs: renderPlaybookConfigsDialog,
      playbookConfigEditor: renderPlaybookConfigEditorDialog,
    }

    return dialogComponent[dialogType]()
  }

  const statistics = [
    {
      label: "Pods",
      value: stats.total_pods,
      path: "/pods"
    },
    {
      label: "Checkpoints",
      value: stats.total_checkpoints,
      path: "/checkpoints"
    }
  ]

  const renderLoading = () => {
    const loadingText = loading.verification ? "Verifying cluster"
      : loading.enableCheckpointing ? "Enabling Checkpointing"
        : loading.login ? "Logging in to Cluster"
          : loading.installRunC ? "Installing RunC"
            : "Loading";
    return <Loading text={loadingText} />;
  }

  const isLoading = loading.login || loading.verification || loading.enableCheckpointing || loading.installRunC || authLoading

  return (
    <CustomerContainer title={"Cluster Management"} subtitle="Manage your clusters and their configurations">

      {renderDialog()}
      {isLoading ? renderLoading() : (
        <>
          {!selectedCluster ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50vh',
                textAlign: 'center',
              }}
            >
              <CloudIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                No Cluster Selected
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Add or select a cluster to get started with cluster management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setDialogType("clusterForm")}
                sx={{ textTransform: 'none' }}
              >
                Add New Cluster
              </Button>
            </Box>
          ) : (
            <Stack spacing={4}>
              {/* Cluster Status Section */}
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {selectedCluster.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {clusterType === 'openshift' ? 'OpenShift Cluster' : 'Kubernetes Cluster'}
                    </Typography>
                  </Box>
                  <Chip
                    label={kubeAuthenticated ? "Authenticated" : "Authentication Error"}
                    color={kubeAuthenticated ? "success" : "error"}
                    variant="outlined"
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  {statistics.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card
                        sx={{
                          height: '100%',
                          cursor: 'pointer'
                        }}
                        onClick={() => item.value ? navigate(item.path) : null}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <StorageIcon sx={{ color: 'primary.main', mr: 1 }} />
                            <Typography variant="subtitle1" color="text.secondary">
                              {item.label}
                            </Typography>
                          </Box>
                          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {statLoading ? (
                              <CircularProgress size={24} />
                            ) : (
                              item.value || 0
                            )}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Actions Section */}
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Cluster Actions
                </Typography>
                <Grid container spacing={2}>
                  {kubeAuthenticated && (
                    <>
                      <Grid item xs={12} sm={6} md={4}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={handleClusterVerification}
                          startIcon={<VerifyIcon />}
                          sx={{ height: 48, textTransform: 'none' }}
                        >
                          Verify Cluster
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => setDialogType("enableCheckpoint")}
                          startIcon={<TaskAltIcon />}
                          sx={{ height: 48, textTransform: 'none' }}
                        >
                          Enable Checkpointing
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={handleInstallRunc}
                          startIcon={<InstallIcon />}
                          sx={{ height: 48, textTransform: 'none' }}
                        >
                          Install runc
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={handleShowNodeConfig}
                          startIcon={<PolylineIcon />}
                          sx={{ height: 48, textTransform: 'none' }}
                        >
                          Node Config
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={handlePlaybookConfigs}
                          startIcon={<LibraryBooksIcon />}
                          sx={{ height: 48, textTransform: 'none' }}
                        >
                          Playbook Configs
                        </Button>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="warning"
                      onClick={handleShowClusterConfig}
                      startIcon={<Edit />}
                      sx={{ height: 48, textTransform: 'none' }}
                    >
                      Edit Cluster Config
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* Danger Zone */}
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'error.light', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.contrastText' }}>
                      Danger Zone
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'error.contrastText' }}>
                      Irreversible and destructive actions
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => setDialogType("deleteCluster")}
                    startIcon={<Delete />}
                    sx={{ textTransform: 'none' }}
                  >
                    Delete Cluster
                  </Button>
                </Box>
              </Paper>
            </Stack>
          )}
        </>
      )}
    </CustomerContainer>
  )
}

export default ClusterScreen;
