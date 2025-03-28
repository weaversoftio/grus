import { Box, Card, Grid2 as Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { formatTimestamp } from "../../utils/formateDate";
import { grey } from '@mui/material/colors';

const classes = {
  tableHead: {
    background: 'lightgray',
    fontWeight: 'bold',
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
const TableComponent = ({
  data = [],
  tableHeaders = [],
  total = 0,
  rowsPerPage,
  page,
  handleRowsPerPageChange = () => null,
  handlePageChange = () => null
}) => {
  
  const rowStyle = { head: classes.tableHead, root: classes.bold }
  const cellStyle = { head: classes.bold, root: classes.tableCellRoot }

  const renderTable = () => {
    if (!data || !data.length) return (
      <Typography>No Record Found</Typography>
    )

    return (
      <TableContainer>
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
        <TableRow sx={{ '& th': { padding: '7px', fontWeight: 'bold' } }}>
          {tableHeaders.map(({ name }) => <TableCell classes={cellStyle} key={name}>{name}</TableCell>)}
        </TableRow>
      </TableHead>
    )
  }

  const renderRow = (rowData) => {
    const rowName = rowData?.name
    return (
      <TableRow key={rowName} classes={rowStyle}>
        {tableHeaders.map(({ key, name, action = null }) => {
          if (action) {
            return (
              <TableCell
                classes={cellStyle}
                key={`tableCell-actions-${key}`}
              >
                {action(rowData)}
              </TableCell>
            );
          }

          const value = getNestedValue(rowData, key);
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
              key={`tableCell-${key}`}
            >
              <Tooltip title={displayValue}>

                {displayValue}
              </Tooltip>
            </TableCell>
          );
        })}
      </TableRow>
    );
  }

  const renderTableBody = () => {
    const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    return (
      <TableBody style={classes.tableBody} key="tablebody">
        {paginatedData.map(renderRow)}
      </TableBody>
    )
  }

  const renderPagination = () => {
    if (!total) return null
    return (
      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    )
  }

  return (
    <>
      {renderTable()}
      {renderPagination()}
    </>
  )
}

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
};

export default TableComponent;