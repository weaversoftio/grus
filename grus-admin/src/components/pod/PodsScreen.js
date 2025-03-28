import { Box, Button, Grid2 as Grid, IconButton, Tooltip, Typography } from "@mui/material"
import { useEffect, useMemo, useState } from "react";
import { useSnackbar } from 'notistack';
import { podsApi } from "../../api/podsApi";
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import DialogComponent from "../common/Dialog";
import { useSelector } from "react-redux";
import ReactJson from "react-json-view";
import CircularProgress from '@mui/material/CircularProgress';
import TableComponent from "./PodsTable";
import { Loading } from "../common/loading";

const PodsScreen = ({ classes }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCluster = null } = useSelector(state => state.cluster)

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [currentPod, setCurrentPod] = useState(null)
  const [total, setTotal] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [page, setPage] = useState(0)
  const [error, setError] = useState('')

  const tableHeaders = [
    { name: "", key: "" },
    { name: "Name", key: "metadata.name" },
    { name: "Namespace", key: "metadata.namespace" },
    { name: "Nodename", key: "spec.nodeName" },
    { name: "No. of Containers", key: "spec.containers.length" },
    {
      name: "Actions", key: "", action: (data) => (
        <Tooltip title="Inspect Pod">
          <IconButton onClick={() => handleShowPods(data?.metadata?.name)}><VisibilityIcon /></IconButton>
        </Tooltip>
      )
    },
  ]

  const nestedTableHeaders = [
    { name: "Name", key: "container_name" },
    { name: "Image", key: "image_name" },
    { name: "Action", key: "" }
  ]

  const handleShowPods = (name) => {
    const pod = data.find((item) => item?.metadata?.name === name)
    setCurrentPod(pod)
  }

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleGetPods = async () => {
    try {
      setLoading(true)
      const result = await podsApi.getList()
      const data = JSON.parse(result.pods)
      // console.log({ result })
      // const data = JSON.parse(podsData.pods)
      setData(data.items)
      setTotal(data.items.length)
    } catch (error) {
      console.error("Pods error ", error)
    }
    setLoading(false)

  }

  useEffect(() => {
    handleGetPods()
  }, [])

  const renderError = () => {
    return (
      <Grid size={4}>
        <Typography color="error">{error}</Typography>
      </Grid>
    )
  }

  const renderDialog = () => {
    if (!currentPod) return
    const { metadata = null } = currentPod || {}
    const { name = "" } = metadata

    return (
      <DialogComponent
        title={`Name: ${name}`}
        open={!!name}
        onClose={() => setCurrentPod(null)}
        renderButtons={() => <Button onClick={() => setCurrentPod(null)} variant="contained">Ok</Button>}>
        <ReactJson src={currentPod} theme="pop" collapseStringsAfterLength={50} />
      </DialogComponent>
    )
  }

  if (!selectedCluster) return (
    <Box height={"100%"} width={"100%"} textAlign={"center"}>
      <Typography>Add Cluster To Get Start</Typography>
    </Box>
  )

  if (loading) return (
    <Loading />
  )

  return (
    <Box>
      {renderError()}
      {renderDialog()}
      <TableComponent
        classes={classes}
        data={data}
        tableHeaders={tableHeaders}
        nestedTableHeaders={nestedTableHeaders}
        total={total}
        rowsPerPage={rowsPerPage}
        page={page}
        handleRowsPerPageChange={handleRowsPerPageChange}
        handlePageChange={handlePageChange}
      />
    </Box>
  )
}

export default PodsScreen;