import { Box, Button, Card, CircularProgress, Grid2 as Grid, Paper, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import TableComponent from "./SecretsTable";
import { useSnackbar } from 'notistack';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import { useDispatch, useSelector } from "react-redux";
import DialogComponent from "../common/Dialog";
import DeleteIcon from '@mui/icons-material/Delete';
import { secretsActions } from "../../features/secret/secretSlice";
import { secretApi } from "../../api/secretApi";
import { Loading } from "../common/loading";
import AddIcon from '@mui/icons-material/Add';
import { CustomerContainer } from "../common/CustomContainer";

const SecretsScreen = ({ classes }) => {
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar();
  const { list: secretList = [], loading: secretListLoading } = useSelector(state => state.secrets)
  const [loading, setLoading] = useState(false)
  const [dialogType, setDialogType] = useState("")
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [page, setPage] = useState(0)
  const [error, setError] = useState('')
  const [currentRowItem, setCurrentRowItem] = useState(null)
  const [isEdit, setIsEdit] = useState(false)
  const [name, setName] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    handleGetSecretList();
  }, [])

  const handleGetSecretList = () => {
    dispatch(secretsActions.getList())
  }


  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleDeleteSecret = async () => {
    try {
      setIsActionLoading(true)
      await secretApi.remove(currentRowItem.name)
      handleGetSecretList()
      enqueueSnackbar(`Secret: ${currentRowItem.name} successfully deleted`, { variant: "success" })
    } catch (error) {
      console.error("Secret delete error", error.toString())
      enqueueSnackbar(`Secret: ${currentRowItem.name} deletion failed`, { variant: "error" })
    }
    handleClearDialog()
  }



  const handleSubmit = async () => {

    if (isEdit) {
      setIsActionLoading(true)
      enqueueSnackbar(`Secret: ${name} update initiated`, { variant: "info" })
      try {
        await secretApi.update({
          name,
          api_key: apiKey,
        })
        enqueueSnackbar(`Secret: ${name} successfully updated`, { variant: "success" })
      } catch (error) {
        console.error("Secret update error", error.toString())
        enqueueSnackbar(`Secret: ${name} update failed`, { variant: "error" })
      }
    } else {
      enqueueSnackbar(`Secret: ${name} creation initiated`, { variant: "info" })
      try {
        await secretApi.create({
          name,
          api_key: apiKey,
        })
        enqueueSnackbar(`Secret: ${name} successfully created`, { variant: "success" })
      } catch (error) {
        console.error("Secret creation error", error.toString())
        enqueueSnackbar(`Secret: ${name} creation failed`, { variant: "error" })
      }
    }
    handleGetSecretList()
    handleClearDialog()
  }

  //diaglog for analysis logs
  const handleOpenEditDialog = (secret) => {
    setDialogType("secretForm")
    setCurrentRowItem(secret)
    setName(secret.name)
    setApiKey(secret.api_key)
    setIsEdit(true)
  }

  const handleOpenDeleteDialog = (secret) => {
    setDialogType("secretDelete")
    setCurrentRowItem(secret)
  }

  const handleClearDialog = () => {
    setIsActionLoading(false)
    setLoading(false)
    setDialogType("")
    setName("")
    setApiKey("")
    setIsEdit(false)
    setCurrentRowItem(null)
  }

  const renderSecretDeleteDialog = () => {
    return (
      <DialogComponent open={!!dialogType} onClose={() => handleClearDialog("")} paperProps={{ maxWidth: 500 }}>
        <Box gap={2} display={"flex"} flexDirection={"column"}>
          <Typography variant="h5">Delete Secret</Typography>
          <Typography>Are you sure you want to delete {currentRowItem?.name} secret?</Typography>
          <Button variant="contained" onClick={() => handleDeleteSecret()}>Delete</Button>
        </Box>
      </DialogComponent>
    )
  }

  const renderSecretForm = () => {
    return (
      <DialogComponent open={!!dialogType} onClose={() => handleClearDialog("")} paperProps={{ maxWidth: 500 }}>
        <Box gap={2} display={"flex"} flexDirection={"column"}>
          <Typography variant="h5">{isEdit ? "Edit Secret" : "Add New Secret"}</Typography>
          <TextField
            label="Secret Name"
            onChange={(e) => setName(e.target.value)}
            value={name}
            disabled={isEdit}
          />

          <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>API Keys</Typography>
            {Object.entries(apiKey).map(([key, value], index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Key Name"
                  value={key}
                  onChange={(e) => {
                    const newApiKeys = { ...apiKey };
                    const oldValue = newApiKeys[key];
                    delete newApiKeys[key];
                    newApiKeys[e.target.value] = oldValue;
                    setApiKey(newApiKeys);
                  }}
                  size="small"
                />
                <TextField
                  label="API Key Value"
                  value={value}
                  onChange={(e) => {
                    setApiKey({
                      ...apiKey,
                      [key]: e.target.value
                    });
                  }}
                  size="small"
                />
                <IconButton
                  onClick={() => {
                    const newApiKeys = { ...apiKey };
                    delete newApiKeys[key];
                    setApiKey(newApiKeys);
                  }}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="outlined"
              size="small"
              onClick={() => setApiKey({ ...apiKey, '': '' })}
            >
              Add API Key
            </Button>
          </Box>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!name || Object.keys(apiKey).length === 0}
          >
            {isEdit ? "Update" : "Add"}
          </Button>
        </Box>
      </DialogComponent>
    )
  }

  const renderDialog = () => {
    const dialogContent = {
      secretForm: renderSecretForm(),
      secretDelete: renderSecretDeleteDialog(),
    }
    return dialogContent[dialogType]
  }

  const rowAction = (data) => (
    <Stack direction="row" spacing={1}>
      {currentRowItem && currentRowItem?.name === data?.name && isActionLoading ? <CircularProgress />
        :
        <>
          {/* <Tooltip title={"Edit Secret"} placement="top">
            <IconButton 
              aria-label="edit secret"
              onClick={() => handleOpenEditDialog(data)}
              size="small"
            >
              <EditIcon fontSize="small" color="primary" />
            </IconButton>
          </Tooltip> */}
          <Tooltip title="Delete Secret" placement="top">
            <IconButton
              aria-label="delete secret"
              onClick={() => handleOpenDeleteDialog(data)}
              size="small"
            >
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        </>
      }

    </Stack>)

  const renderError = () => {
    return (
      <Grid size={4}>
        <Typography color="error">{error}</Typography>
      </Grid>
    )
  }

  const filteredData = secretList.filter(item => {
    const searchFields = [
      item.name,
    ];
    return searchFields.some(field => String(field).toLowerCase().includes(searchTerm.toLowerCase()))
  })

  return (
    <CustomerContainer title="Secrets">
      {secretListLoading ? <Loading /> : (
        <>
          <Button
            variant="contained"
            onClick={() => setDialogType("secretForm")}
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
            Add Secret Key
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
                placeholder="Secret Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
            <TableComponent
              classes={classes}
              data={filteredData}
              total={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              handleRowsPerPageChange={handleRowsPerPageChange}
              handlePageChange={handlePageChange}
              renderRowAction={rowAction}
            />
          </Paper>

        </>
      )}
    </CustomerContainer>
  )
}

export default SecretsScreen;