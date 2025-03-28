import { Box, Button, Card, CircularProgress, FormControl, Grid2 as Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material"
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
import { usersActions } from "../../features/users/usersSlice";
import { userApi } from "../../api/userApi";
import { Loading } from "../common/loading";
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
const UserScreen = ({ classes }) => {
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar();
  const { list: userList = [], loading: userListLoading } = useSelector(state => state.users)
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
  const [role, setRole] = useState("")
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    handleGetUserList();
  }, [])

  const handleGetUserList = () => {
    dispatch(usersActions.getList())
  }


  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleDeleteUser = async () => {
    try {
      setIsActionLoading(true)
      await userApi.remove(currentRowItem.name)
      handleGetUserList()
      enqueueSnackbar(`User ${currentRowItem.name} successfully deleted`, { variant: "success" })
    } catch (error) {
      console.error("User delete error", error.toString())
      enqueueSnackbar(`User ${currentRowItem.name} deletion failed`, { variant: "error" })
    }
    handleClearDialog()
  }



  const handleSubmit = async () => {

    if (isEdit) {
      setIsActionLoading(true)
      enqueueSnackbar(`User ${name} update initiated`, { variant: "info" })
      try {
        await userApi.update({
          name: name,
          username: username,
          password: password,
          role: role
        })
        enqueueSnackbar(`User ${name} successfully updated`, { variant: "success" })
      } catch (error) {
        console.error("User update error", error.toString())
        enqueueSnackbar(`User ${name} update failed`, { variant: "error" })
      }
    } else {
      enqueueSnackbar(`User ${name} creation initiated`, { variant: "info" })
      try {
        await userApi.create({
          name: name,
          username: username,
          password: password,
          role: role
        })
        enqueueSnackbar(`User ${name} successfully created`, { variant: "success" })
      } catch (error) {
        console.error("User creation error", error.toString())
        enqueueSnackbar(`User ${name} creation failed`, { variant: "error" })
      }
    }
    handleGetUserList()
    handleClearDialog()
  }

  //diaglog for analysis logs
  const handleOpenEditDialog = (user) => {
    setDialogType("userForm")
    setCurrentRowItem(user)
    setName(user.userdetails.name)
    setUsername(user.name)
    setPassword(user.userdetails.password)
    setRole(user.userdetails.role)
    setIsEdit(true)
  }

  const handleOpenDeleteDialog = (user) => {
    setDialogType("userDelete")
    setCurrentRowItem(user)
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

  const renderUserDeleteDialog = () => {
    return (
      <DialogComponent open={!!dialogType} onClose={() => handleClearDialog("")} paperProps={{ maxWidth: 500 }}>
        <Box gap={2} display={"flex"} flexDirection={"column"}>
          <Typography variant="h5">Delete User</Typography>
          <Typography>Are you sure you want to delete {currentRowItem?.name} user?</Typography>
          <Button variant="contained" onClick={() => handleDeleteUser()}>Delete</Button>
        </Box>
      </DialogComponent>
    )
  }

  const renderUserForm = () => {
    return (
      <DialogComponent open={!!dialogType} onClose={() => handleClearDialog("")} paperProps={{ maxWidth: 500 }}>
        <Box gap={2} display={"flex"} flexDirection={"column"}>
          <Typography variant="h5">{isEdit ? "Edit User" : "Add New User"}</Typography>
          <TextField
            label="Username"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            disabled={isEdit}
          />
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Name"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <TextField
            type='password'
            label="Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <Button variant="contained" onClick={handleSubmit}>{isEdit ? "Update" : "Add"}</Button>
        </Box>
      </DialogComponent>
    )
  }

  if (userListLoading) return (
    <Loading />
  )


  const renderDialog = () => {
    const dialogContent = {
      userForm: renderUserForm(),
      userDelete: renderUserDeleteDialog(),
    }
    return dialogContent[dialogType]
  }

  const tableHeaders = [
    { name: "Username", key: "name" },
    { name: "Name", key: "userdetails.name" },
    { name: "Role", key: "userdetails.role" },
    {
      name: "Actions", key: "", action: (data) => (
        <>
          {
            <Stack direction="row" spacing={1}>
              {currentRowItem && currentRowItem?.name === data?.name && isActionLoading ? <CircularProgress />
                :
                <>
                  <Tooltip title={"Edit User"} placement="top">
                    <IconButton aria-label="edit user" size="small" onClick={() => handleOpenEditDialog(data)}>
                      <EditIcon color="primary" fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User" placement="top">
                    <IconButton aria-label="delete user" size="small" onClick={() => handleOpenDeleteDialog(data)}>
                      <DeleteIcon color="error" fontSize="small" />
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

  const filteredData = userList.filter(item => {
    const searchFields = [
      item.name,
      item.userdetails.name
    ];
    return searchFields.some(field => String(field).toLowerCase().includes(searchTerm.toLowerCase()))
  })

  return (
    <>
      <Button
        variant="contained"
        onClick={() => setDialogType("userForm")}
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
        Add User
      </Button>
      <Card sx={{ padding: '5px 10px' }}>
        {renderError()}
        {renderDialog()}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBlock: 2, ml: 1 }}>
          <Typography variant="h6" gutterBottom component="div">
            Search
          </Typography>
          <TextField
            sx={{ width: '300px' }}
            size="small"
            placeholder="Username, Name"
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
      </Card>
    </>
  )
}

export default UserScreen;