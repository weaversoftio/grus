import { Box, Card, Button, CircularProgress, Collapse, Grid2 as Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { formatTimestamp } from "../../utils/formateDate";
import { grey } from '@mui/material/colors';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { checkpointApi } from "../../api/checkpointApi";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";

const classes = {
  tableHead: {
    background: 'lightgray',
    fontWeight: 'bold'
  },
  tableBody: {
    background: '#fff',
  },
  tableCellRoot: {
    maxWidth: "50px",
    padding: 7,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    borderColor: grey[50],
    overflow: "hidden"
  },
  bold: {
    fontWeight: 'bold',
  },
  tablePaginationGridContainer: {
    paddingBlock: 10,
  },
  tablePaginationSelect: {
    '& .MuiSelect-root': {
      padding: 0,
      paddingBlock: 2,
      paddingInline: 15,
    },
    '& .MuiSelect-icon': {
      color: '#000',
      top: 0,
      marginInlineEnd: -5
    },
    '& .MuiInput-underline': {
      '&:before': {
        borderBottom: 0
      },
      '&:hover:not(.Mui-disabled):before': {
        borderBottom: 0
      },
      '&:after': {
        borderBottom: 0,
      }
    }
  },
  tableStriped: {
    '& tr:nth-child(even)': {
      backgroundColor: '#f2f2f2'
    }
  },
  tablePaginationTextFeild: {
    marginInline: 10,
    width: 35,
    '& .MuiInputBase-root': {
      fontSize: 14,
      padding: 0,
      height: 30,
    },
    '& .MuiOutlinedInput': {
      '&-input': {
        padding: 0,
        textAlign: 'center',
        alignSelf: 'center',
        '&[type=number]': {
          '-moz-appearance': 'textfield',
        },
        '&::-webkit-outer-spin-button': {
          '-webkit-appearance': 'none',
          margin: 0,
        },
        '&::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          margin: 0,
        },
      },
      '&-inputMarginDense': {
        paddingTop: 0,
        paddingBottom: 0
      },
      '&-notchedOutline': {
        borderColor: '#a6a6a6'
      },
      '&-root': {
        '&:hover fieldset': {
          borderColor: '#797979'
        },
        '&.Mui-focused fieldset': {
          border: '1px solid #797979',
        }
      }
    }
  },
  tablePaginationArrow: {
    transform: 'rotateY(180deg)',
    marginInlineStart: 10,
    padding: 10
  },
  tablePaginationArrowOppisite: {
    transform: 'rotateY(0deg)',
    marginInlineEnd: 10,
    padding: 10
  },
  tablePaginationGridItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50
  },
}

const rowStyle = { head: classes.tableHead, root: classes.bold }
const cellStyle = { head: classes.bold, root: classes.tableCellRoot }

const TableComponent = ({
  data = [],
  tableHeaders = [],
  nestedTableHeaders,
  total = 0,
  rowsPerPage,
  page,
  handleRowsPerPageChange = () => null,
  handlePageChange = () => null
}) => {
  const { selectedCluster = null } = useSelector(state => state.cluster)
  const { kube_api_url: kubeApi = "" } = selectedCluster?.cluster_config_details || {}
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    handlePageChange(null, 0)
  }, [searchTerm])

  const filteredData = data.filter(item => {
    const searchFields = [
      getNestedValue(item, 'metadata.name'),
      getNestedValue(item, 'metadata.namespace'),
      getNestedValue(item, 'spec.nodeName')
    ];
    return searchFields.some(field =>
      String(field).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const renderTable = () => {
    if ((!filteredData || !filteredData.length) && !searchTerm) return (
      <Typography>No Record Found</Typography>
    )

    return (
      <TableContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt:2 }}>
          <Typography variant="h6" gutterBottom component="div">
            Search
          </Typography>
          <TextField
            size="small"
            placeholder="Name, Namespace, Node"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
        <Table>
          {renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    );
  }

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          {tableHeaders.map(({ name }, index) => <TableCell sx={{ fontWeight: "bold" }} key={`tableHead-${index}`}>{name}</TableCell>)}
        </TableRow>
      </TableHead>
    )
  }

  const renderTableBody = () => {
    const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
      <TableBody style={classes.tableBody}>
        {paginatedData.map((item) => (
          <Row
            key={item.metadata?.name || item.id}
            kubeApi={kubeApi}
            nestedTableHeaders={nestedTableHeaders}
            row={item}
            tableHeaders={tableHeaders}
          />
        ))}
      </TableBody>
    )
  }

  const renderPagination = () => {
    return (
      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    )
  }

  return (
    <Card sx={{ padding: '5px 10px' }}>
      {renderTable()}
      {renderPagination()}
    </Card>
  )
}

const Row = (props) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false)
  const { row, tableHeaders, nestedTableHeaders, kubeApi = "" } = props;
  const { metadata = null, spec = null } = row || {}
  const { name: podName = "", namespace } = metadata || {}
  const { nodeName = "" } = spec || {}

  const [open, setOpen] = useState(false);

  const handleCreateCheckpoint = async (containerName) => {
    try {
      setLoading(true)
      enqueueSnackbar("Checkpoint creation started", { variant: "info" })
      const result = await checkpointApi.createCheckpointKubelet({
        pod_name: podName,
        namespace: namespace,
        node_name: nodeName,
        container_name: containerName,
        kube_api_address: kubeApi
      })
      if (!result?.success) {
        enqueueSnackbar("Checkpoint creation failed", { variant: "error" })
        console.error("Checkpoint creation error ", result)
        setLoading(false)
        return;
      }

      enqueueSnackbar(`Checkpoint created for pod ${podName}`, { variant: "success" })
    } catch (error) {
      console.error("Create checkpoint error ", error)
      enqueueSnackbar("Checkpoint creation failed", { variant: "error" })
    }
    setLoading(false)
  }

  return (
    <>
      <TableRow key={podName} sx={{
        "& td": { borderBottom: "none" },
      }}>
        <TableCell sx={{ borderBottom: "none" }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {tableHeaders.map(({ key, name, action = null }, index) => {
          if (!name) return <></>;

          if (action) {
            return (
              <TableCell
                classes={cellStyle}
                key={`tableCell-${key}-${index}`}
                sx={{ borderBottom: "none" }}
              >
                {action(row)}
              </TableCell>
            );
          }

          const value = getNestedValue(row, key);
          const displayValue = (value && key === "createdAt" ? formatTimestamp(value) : value) || "N/A"

          return (
            <TableCell
              style={{
                maxWidth: "100px",
                padding: 7,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: "hidden"
              }}
              sx={{ borderBottom: "none" }}
              key={`tableCell-${key}-${index}`}
            >
              <Tooltip title={displayValue}>

                {displayValue}
              </Tooltip>
            </TableCell>
          );
        })}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Containers
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow classes={rowStyle} >
                    {nestedTableHeaders.map(({ name }, index) => <TableCell classes={cellStyle} key={`tableHead-${index}`}>{name}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row?.spec?.containers.map((item, index) => (
                    <TableRow key={item.name} sx={{
                      "& td": {
                        borderBottom: index === row?.spec?.containers.length - 1 ? "none" : "1px solid rgba(224, 224, 224, 1)",
                      },
                    }}>
                      <TableCell style={{ width: 200 }}>{item.name}</TableCell>
                      <TableCell style={{
                        width: "300px",
                        padding: 7,
                      }}>{item.image}</TableCell>
                      <TableCell>
                        {
                          loading ?
                            <CircularProgress /> :
                            <Button variant="contained" size="small" onClick={() => handleCreateCheckpoint(item.name)}>
                              Create Checkpoint
                            </Button>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )

}

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
};

export default TableComponent;