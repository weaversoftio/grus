import { Box, Button, CircularProgress, Grid2 as Grid, TextField, Typography, Card, Paper } from "@mui/material"
import { useEffect, useState } from "react";
import TableComponent from "../common/Table";
import { useSnackbar } from 'notistack';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useDispatch, useSelector } from "react-redux";
import DialogComponent from "../common/Dialog";
import { registryActions } from "../../features/registry/registrySlice";
import { registryApi } from "../../api/registryApi";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Loading } from "../common/loading";
import AddIcon from '@mui/icons-material/Add';
import { CustomerContainer } from "../common/CustomContainer";
const RegistryScreen = ({ classes }) => {
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar();
  const { list: registryList = [], loading: registryListLoading } = useSelector(state => state.registry)
  const [loading, setLoading] = useState(false)
  const [dialogType, setDialogType] = useState("")
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [page, setPage] = useState(0)
  const [error, setError] = useState('')
  const [currentRowItem, setCurrentRowItem] = useState(null)
  const [isEdit, setIsEdit] = useState(false)
  const [registry, setRegistry] = useState("")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    handleGetRegistryList();
  }, [])

  const handleGetRegistryList = () => {
    dispatch(registryActions.getList())
  }


  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleDeleteRegistry = async () => {
    try {
      setIsActionLoading(true)
      await registryApi.remove(currentRowItem.name)
      handleGetRegistryList()
      enqueueSnackbar(`Registry: ${currentRowItem.name} successfully deleted`, { variant: "success" })
    } catch (error) {
      console.error("Registry delete error", error.toString())
      enqueueSnackbar(`Registry: ${currentRowItem.name} deletion failed`, { variant: "error" })
    }
    handleClearDialog()
  }



  const handleSubmit = async () => {

    if (isEdit) {
      setIsActionLoading(true)
      enqueueSnackbar(`Registry: ${name} update initiated`, { variant: "info" })
      try {
        await registryApi.update({
          name,
          registry,
          username: username,
          password: password
        })
        enqueueSnackbar(`Registry: ${name} successfully updated`, { variant: "success" })
      } catch (error) {
        console.error("Registry update error", error.toString())
        enqueueSnackbar(`Registry: ${name} update failed`, { variant: "error" })
      }
    } else {
      enqueueSnackbar(`Registry: ${name} creation initiated`, { variant: "info" })
      try {
        await registryApi.create({
          name,
          registry,
          username: username,
          password: password
        })
        enqueueSnackbar(`Registry: ${name} successfully created`, { variant: "success" })
      } catch (error) {
        console.error("Registry creation error", error.toString())
        enqueueSnackbar(`Registry: ${name} creation failed`, { variant: "error" })
      }
    }
    handleGetRegistryList()
    handleClearDialog()
  }

  //diaglog for analysis logs
  const handleOpenEditDialog = (registry) => {
    setDialogType("registryForm")
    setCurrentRowItem(registry)
    setRegistry(registry.registry_config_details.registry)
    setName(registry.name)
    setUsername(registry.registry_config_details.username)
    setPassword(registry.registry_config_details.password)
    setIsEdit(true)
  }

  const handleOpenDeleteDialog = (registry) => {
    setDialogType("registryDelete")
    setCurrentRowItem(registry)
  }

  const handleClearDialog = () => {
    setIsActionLoading(false)
    setLoading(false)
    setDialogType("")
    setRegistry("")
    setName("")
    setUsername("")
    setPassword("")
    setIsEdit(false)
    setCurrentRowItem(null)
  }

  const renderRegistryDeleteDialog = () => {
    return (
      <DialogComponent open={!!dialogType} onClose={() => handleClearDialog("")} paperProps={{ maxWidth: 500 }}>
        <Box gap={2} display={"flex"} flexDirection={"column"}>
          <Typography variant="h5">Delete Registry</Typography>
          <Typography>Are you sure you want to delete this registry?</Typography>
          <Button variant="contained" onClick={() => handleDeleteRegistry()}>Delete</Button>
        </Box>
      </DialogComponent>
    )
  }

  const renderRegistryLoginForm = () => {
    return (
      <DialogComponent open={!!dialogType} onClose={() => handleClearDialog("")} paperProps={{ maxWidth: 500 }}>
        <Box gap={2} display={"flex"} flexDirection={"column"}>
          <Typography variant="h5">Add New Registry</Typography>
          <TextField
            label="Config Name"
            onChange={(e) => setName(e.target.value)}
            value={name}
            disabled={isEdit}
          />
          <TextField
            label="Registry"
            onChange={(e) => setRegistry(e.target.value)}
            value={registry}
          />
          <TextField
            label="Username"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <TextField
            type='password'
            label="Registry Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <Button variant="contained" onClick={handleSubmit}>Add</Button>
        </Box>
      </DialogComponent>
    )
  }


  const renderDialog = () => {
    const dialogContent = {
      registryForm: renderRegistryLoginForm(),
      registryDelete: renderRegistryDeleteDialog(),
    }
    return dialogContent[dialogType]
  }

  const tableHeaders = [
    { name: "Config Name", key: "name" },
    { name: "Registry", key: "registry_config_details.registry" },
    { name: "Username", key: "registry_config_details.username" },
    {
      name: "Actions", key: "", action: (data) => (
        <>
          {
            <Stack direction="row" spacing={1}>
              {currentRowItem && currentRowItem?.name === data?.name && isActionLoading ? <CircularProgress />
                :
                <>
                  {/* <Tooltip title={"Edit Registry"}>
                    <IconButton aria-label="edit registry" onClick={() => handleOpenEditDialog(data)} size="small">
                      <EditIcon fontSize="small" color="primary" />
                    </IconButton>
                  </Tooltip> */}
                  <Tooltip title="Delete Registry">
                    <IconButton aria-label="delete registry" onClick={() => handleOpenDeleteDialog(data)} size="small">
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Tooltip>
                </>
              }

            </Stack>
          }
        </>
      )
    },
  ]

  const renderError = () => {
    return (
      <Grid size={4}>
        <Typography color="error">{error}</Typography>
      </Grid>
    )
  }

  const filteredData = registryList.filter(item => {
    const searchFields = [
      item.name,
      item.registry_config_details.registry,
      item.registry_config_details.username
    ];
    return searchFields.some(field => String(field).toLowerCase().includes(searchTerm.toLowerCase()))
  })

  return (
    <CustomerContainer title="Registry">
      {registryListLoading ? <Loading /> : (
        <>
          <Button
            variant="contained"
            onClick={() => setDialogType("registryForm")}
            sx={{
              backgroundColor: 'primary.main',
              borderRadius: '8px',
              textTransform: 'none',
              mb: 2,
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: 'primary.dark',
                boxShadow: 2,
              },
            }}
            startIcon={<AddIcon />}
          >
            Add Registry
          </Button>
          <Paper elevation={0} sx={{ px: 3, py: 1, bgcolor: 'background.paper', borderRadius: 2 }}>
            {renderError()}
            {renderDialog()}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBlock: 2, ml: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Search
              </Typography>
              <TextField
                sx={{ width: '300px' }}
                size="small"
                placeholder="Config Name, Registry, Username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
            <TableComponent
              classes={classes}
              data={filteredData}
              tableHeaders={tableHeaders}
              total={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              handleRowsPerPageChange={handleRowsPerPageChange}
              handlePageChange={handlePageChange}
            />
          </Paper>
        </>
      )}
    </CustomerContainer>
  )
}

export default RegistryScreen;