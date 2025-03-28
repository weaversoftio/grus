import { useState } from "react";
import {
  Box,
  Card,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Tooltip,
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const tableHeaders = [
  { name: "", key: "expand" },
  { name: "Name", key: "name" },
  { name: "Actions", key: "actions" }
];

const nestedTableHeaders = [
  { name: "Key Name", key: "keyName" },
  { name: "API Key", key: "key" },
];

const Row = ({ row, renderRowAction }) => {
  const [open, setOpen] = useState(false);

  const apiKeysArray = Object.entries(row.api_key || {}).map(([keyName, key]) => ({
    keyName,
    key
  }));

  return (
    <>
      <TableRow sx={{
        "& td": { borderBottom: "none" },
        backgroundColor: open ? "rgba(233, 233, 233, 0.5)" : "white",
      }}>
        <TableCell sx={{ width: '50px' }}>
          <IconButton size="small" onClick={() => setOpen(!open)} >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell sx={{ width: '150px' }}>
          {renderRowAction(row)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                API Keys
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {nestedTableHeaders.map((header) => (
                      <TableCell key={header.key}>{header.name}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apiKeysArray.map((apiKey, index) => (
                    <TableRow key={apiKey.keyName} sx={{
                      "& td": {
                        borderBottom: index === apiKeysArray.length - 1 ? "none" : "1px solid rgba(224, 224, 224, 1)",
                      },
                    }}>
                      <TableCell>{apiKey.keyName}</TableCell>
                      <TableCell>
                        <Tooltip title={apiKey.key}>
                          <span>{apiKey.key.length > 50 ? `${apiKey.key.slice(0, 50)}...` : apiKey.key}</span>
                        </Tooltip>
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
  );
};

const SecretsTable = ({
  data = [],
  page = 0,
  rowsPerPage = 5,
  total = 0,
  handleRowsPerPageChange = () => { },
  handlePageChange = () => { },
  renderRowAction = () => { }
}) => {

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {tableHeaders.map((header) => (
                <TableCell key={header.key} sx={{ fontWeight: 'bold' }}>{header.name}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <Row key={row.id} row={row} renderRowAction={renderRowAction} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </>
  );
};

export default SecretsTable; 