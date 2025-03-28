import { Box, Typography, Button, Select, MenuItem, FormControl, TextField, Stack, Grid2 as Grid, Card, CardContent, CircularProgress } from "@mui/material"
import { useDispatch, useSelector } from "react-redux";
import { Loading } from "./common/loading";
import { clusterActions } from "../features/cluster/clusterSlice";
import { useEffect, useState } from "react";
import DialogComponent from "./common/Dialog";
import { useSnackbar } from "notistack";
import { clusterApi } from "../api/clusterApi";
import { useNavigate } from "react-router-dom";
import { Delete, SystemUpdateAlt as InstallIcon, SafetyCheck as VerifyIcon } from "@mui/icons-material";
import { removeCookie } from "../utils/cookies";
import { useProgress } from "./common/ProgressContext";
const HomeScreen = () => {
  const { startTracking } = useProgress()
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
  const [dialogType, setDialogType] = useState("")
  const [clusterName, setClusterName] = useState("")
  const [clusterUrl, setClusterUrl] = useState("")
  const [clusterUsername, setClusterUsername] = useState("")
  const [clusterPassword, setClusterPassword] = useState("")
  const [statLoading, setStatLoading] = useState(false)
  const [stats, setStats] = useState({ total_pods: 0, total_checkpoints: 0 });

  const isCheckpointEnabled = kubeAuthenticated && checkpointingEnabled

  useEffect(() => {
    const fetchStats = async () => {
      if (!kubeAuthenticated) return
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

  const handleAddCluster = async (cluster) => {
    enqueueSnackbar("Creating new cluster initiated...", { variant: "info" })
    await clusterApi.create({
      name: clusterName,
      kube_api_url: clusterUrl,
      kube_username: clusterUsername,
      kube_password: clusterPassword
    })

    enqueueSnackbar("New cluster added...", { variant: "success" })

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

  const handleEnableCheckpointing = async () => {
    enqueueSnackbar("Enable checkpointing started", { variant: "info" })
    const { payload = null } = await dispatch(clusterActions.enableCheckpointing({ clusterType, clusterName: selectedCluster.name }))
    const { success = false } = payload || {}
    if (!success) {
      enqueueSnackbar("Enable checkpointing failed", { variant: "error" })
      return
    }
    enqueueSnackbar("Enable checkpointing successful", { variant: "success" })
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

  const handleClearClusterForm = () => {
    setDialogType("")
    setClusterName("")
    setClusterUrl("")
    setClusterUsername("")
    setClusterPassword("")
  }

  if (loading.login || loading.verification || loading.enableCheckpointing || loading.installRunC || authLoading) {
    const loadingText = loading.verification ? "Verifying cluster"
      : loading.enableCheckpointing ? "Enabling Checkpointing"
        : loading.login ? "Logging in to Cluster"
          : loading.installRunC ? "Installing RunC"
            : "Loading";
    return <Loading text={loadingText} />;
  }

  const renderClusterForm = () => {
    return (
      <DialogComponent open onClose={handleClearClusterForm} paperProps={{ maxWidth: 500 }}>
        <form onSubmit={handleAddCluster} style={{ width: "100%" }}>
          <Box gap={2} display={"flex"} flexDirection={"column"}>
            <Typography variant='h5'>Add Cluster</Typography>
            <TextField
              label="Cluster Name"
              onChange={(e) => setClusterName(e.target.value)}
              value={clusterName}
            />
            <TextField
              label="Cluster Api Url"
              onChange={(e) => setClusterUrl(e.target.value)}
              value={clusterUrl}
            />
            <TextField
              label="Username"
              onChange={(e) => setClusterUsername(e.target.value)}
              value={clusterUsername}
            />
            <TextField
              type='password'
              label="Password"
              onChange={(e) => setClusterPassword(e.target.value)}
              value={clusterPassword}
            />
            <Button variant="contained" type="submit" style={{ textTransform: "capitalize" }}>Submit</Button>
          </Box>
        </form>
      </DialogComponent>
    )
  }

  const renderDeleteClusterDialog = () => {
    return (
      <DialogComponent open={!!dialogType} onClose={() => setDialogType("")} paperProps={{ maxWidth: 500 }}>
        <Box gap={2} display={"flex"} flexDirection={"column"}>
          <Typography variant="h5">Delete Cluster</Typography>
          <Typography>Are you sure you want to delete {selectedCluster.name} cluster?</Typography>
          <Button variant="contained" onClick={() => handleDeleteCluster()}>Delete</Button>
        </Box>
      </DialogComponent>
    )
  }

  const renderDialog = () => {
    if (!dialogType) return

    const dialogComponent = {
      clusterForm: renderClusterForm,
      deleteCluster: renderDeleteClusterDialog
    }

    return dialogComponent[dialogType]()
  }

  const renderClusterStatus = () => {
    if (kubeAuthenticated) return

    if (!kubeAuthenticated && clusterError) return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
        }}
      >
        <Typography
          variant="h5"
          color="error"
          sx={{
            fontWeight: 300,
            mb: 2,
            textAlign: 'center'
          }}
        >
          Failed to login to cluster
        </Typography>
      </Box>
    )

    return
  }

  const renderEnableCheckpointing = () => {
    if (isCheckpointEnabled) return
    return (
      <Box sx={{ display: "flex", alignItems: "center", width: 350 }}>
        <FormControl sx={{ mr: 1, minWidth: 120 }} size="small" fullWidth variant='outlined'>
          <Select
            value={clusterType}
            onChange={(e) => setClusterType(e.target.value)}
          >
            <MenuItem value="openshift">Openshift</MenuItem>
            <MenuItem value="kubernetes">Kubernetes</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleEnableCheckpointing}
          sx={{
            textTransform: 'none',
            height: 40,
            width: 350
          }}
        >
          Enable Checkpointing
        </Button>
      </Box>
    )
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

  if (!selectedCluster) {
    return (
      <Typography
        variant="h5"
        color="primary"
        sx={{
          fontWeight: 300,
          mb: 2,
          textAlign: 'center'
        }}
      >
        Add or Select a Cluster to get started
      </Typography>
    )
  }

  return (
    <Stack gap={2}>
      {renderDialog()}
      {/* <Button color="primary" onClick={() => setDialogType("clusterForm")} sx={{ position: "absolute", top: 0, right: 0 }}><Edit /></Button> */}

      {kubeAuthenticated && (
        <>
          <Grid container spacing={3}>
            {statistics.map((item, index) => (
              <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }} key={index}>
                <Card
                  sx={{
                    p: 2,
                    boxShadow: 3,
                    borderRadius: 2,
                    textAlign: "center",
                    background: "linear-gradient(135deg,rgba(83, 83, 83, 0.9) 0%, rgba(43, 43, 43, 0.9) 100%)",
                    cursor: "pointer"
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <CardContent>
                    <Typography variant="h7" sx={{ color: "white", fontWeight: "bold" }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h5" sx={{ color: "lightgray", fontWeight: "medium", mt: 1 }}>
                      {statLoading ? <CircularProgress size={15} sx={{ color: "white" }} /> : item.value || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Typography variant="h7" sx={{ textTransform: "capitalize" }}>
            Checkpointing Status: <span style={{ background: isCheckpointEnabled ? "green" : "red", color: "white", borderRadius: 5, paddingInline: 4, paddingBlock: 4, fontSize: 13 }}>{isCheckpointEnabled ? "Enabled" : "Not Enabled"}</span>
          </Typography>
          <Button
            onClick={handleClusterVerification}
            variant="contained"
            sx={{
              textTransform: "none",
              maxWidth: 200
            }}
            startIcon={<VerifyIcon />}
          >Verify Cluster
          </Button>
          {renderEnableCheckpointing()}
          <Button
            onClick={handleInstallRunc}
            variant="contained"
            sx={{
              textTransform: "none",
              maxWidth: 200
            }}
            startIcon={<InstallIcon />}
          >Install runc
          </Button>

        </>
      )}


      {selectedCluster && <Button
        variant="contained"
        color="error"
        onClick={() => setDialogType("deleteCluster")}
        sx={{
          textTransform: 'none',
          mb: 2,
          px: 3,
          py: 1,
          maxWidth: 200,
        }}
        startIcon={<Delete />}
      >
        Delete Cluster
      </Button>}
      {renderClusterStatus()}
    </Stack>
  )
}

export default HomeScreen;
