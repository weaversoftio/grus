import React, { useState } from "react";
import {
  Drawer,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  Button
} from "@mui/material";
import { ExpandLess, ExpandMore, Close, Clear } from "@mui/icons-material";
import { useProgress } from "./ProgressContext";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import LinearProgress from '@mui/material/LinearProgress';
import { useSelector } from "react-redux";

const ProgressTracker = () => {
  const { open, progress, closeTracker, openTracker, clearLogs, loading } = useProgress();
  //TODO: Collect all async task function
  const {loading: loadingObj} = useSelector(state => state.cluster)
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (group) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const groupedProgress = progress.reduce((acc, task) => {
    const { name, message } = task;
    if (!acc[name]) acc[name] = [];
    acc[name].push(message);
    return acc;
  }, {});

  return (
    <>
      <Button
        variant="contained"
        onClick={openTracker}
        sx={{
          right: 10,
          bottom: 10,
          minWidth: 40,
          padding: "5px 10px",
          position: "absolute",
          zIndex: 2,
          background: "linear-gradient(135deg,rgba(83, 83, 83, 0.9) 0%, rgba(43, 43, 43, 0.9) 100%)",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <ManageHistoryIcon />
        {loading && <LinearProgress color="inherit" style={{width: 20, marginTop: 5}}/>}
      </Button>
      <Drawer
        anchor="right"
        open={open}
        variant="persistent"
        sx={{ width: 520, flexShrink: 1 }}
        PaperProps={{ sx: { overflowY: "unset" } }}
      >
        <Box
  sx={{
    width: 520,
    p: 2,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    paddingTop: "74px",
    background: "#f5f5f5", // Light background
    borderRadius: 2,
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  }}
>
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
    <Typography variant="h6" color="black">Task Progress</Typography>
    <IconButton onClick={closeTracker}>
      <Close />
    </IconButton>
  </Box>

  <Box
    sx={{
      flexGrow: 1,
      overflowY: "auto",
      mt: 1,
      bgcolor: "#ffffff",
      color: "#333",
      p: 2,
      borderRadius: 1,
      border: "1px solid #ddd",
    }}
  >

    <Button variant="outlined" sx={{mb:1}} size="small" startIcon={<Clear/>} onClick={clearLogs}>Clear</Button>
    {loading && <LinearProgress style={{width: "100%", marginTop: 5}}/>}

    {Object.keys(groupedProgress).length ? (
      <List>
        {Object.entries(groupedProgress).map(([category, tasks]) => (
          <Box key={category} sx={{ mb: 2 }}>
            <ListItemButton
              onClick={() => toggleGroup(category)}
              sx={{
                bgcolor: "#e3f2fd",
                borderRadius: 1,
                "&:hover": { bgcolor: "#bbdefb" },
              }}
            >
              <ListItemText
                primary={category}
                sx={{
                  fontWeight: "bold",
                  fontFamily: "monospace",
                  color: "#1565c0"
                }}
              />
              {collapsedGroups[category] ? <ExpandMore /> : <ExpandLess />}
            </ListItemButton>
            <Collapse in={!collapsedGroups[category]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {tasks.map((msg, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      borderBottom: "1px solid #ddd",
                      bgcolor: "#fafafa"
                    }}
                  >
                    <ListItemText
                      secondary={
                        <Typography
                          component="span"
                          sx={{
                            whiteSpace: "pre-line",
                            wordBreak: "break-word",
                            fontFamily: "monospace",
                            fontSize: "0.9rem",
                          }}
                        >
                          {msg}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </List>
    ) : (
      <Typography variant="body2" color="textSecondary">
        No logs to show...
      </Typography>
    )}
  </Box>
</Box>


      </Drawer>
    </>
  );
};

export default ProgressTracker;
