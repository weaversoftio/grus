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
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useProgress } from "./ProgressContext";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import LinearProgress from '@mui/material/LinearProgress';
import { useSelector } from "react-redux";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

const ProgressTracker = () => {
  const { open, progress, closeTracker, openTracker, clearLogs, loading } = useProgress();
  const { loading: loadingObj } = useSelector(state => state.cluster)
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (group) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const groupedProgress = progress.reduce((acc, task) => {
    const { task_name, progress: percentage, message } = task;
    if (!acc[task_name]) {
      acc[task_name] = { messages: [], progress: 0 };
    }
    acc[task_name].messages.push(message);
    acc[task_name].progress = percentage;
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
        {loading && <LinearProgress color="inherit" style={{ width: 20, marginTop: 5 }} />}
      </Button>
      <Drawer
        anchor="right"
        open={open}
        variant="persistent"
        sx={{ width: 420, flexShrink: 1 }}
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
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Task Progress</Typography>
            <Box display={"flex"} gap={2}>
              <Button variant="outlined" size="small" startIcon={<DeleteSweepIcon />} onClick={clearLogs}>Clear</Button>
              <Button
                variant="contained"
                color="primary"
                style={{ minWidth: 30 }}
                onClick={closeTracker}>
                <ArrowForwardIosIcon />
              </Button>
            </Box>
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
            {Object.keys(groupedProgress).length ? (
              <List>
                {Object.entries(groupedProgress).map(([category, tasks]) => {
                  const isFailed = tasks.progress === "failed"
                  return (
                    <Box key={category} sx={{ mb: 2 }}>
                      <ListItemButton
                        onClick={() => toggleGroup(category)}
                        sx={{
                          bgcolor: isFailed? "#fee4e4" : "#e3f2fd",
                          borderRadius: 1,
                          "&:hover": { bgcolor: isFailed? "#fcbfbe" : "#bbdefb" },
                        }}
                      >
                        <ListItemText
                          primary={category}
                          sx={{
                            fontWeight: "bold",
                            fontFamily: "monospace",
                            color: isFailed? "#ff0500" : "#1565c0"
                          }}
                        />
                        {collapsedGroups[category] ? <ExpandMore /> : <ExpandLess />}
                      </ListItemButton>
                      <LinearProgress variant="determinate" value={isFailed ? 100 : tasks.progress} color={isFailed ? "error" : "primary"} style={{marginTop: -1}}/>
                      <Collapse in={!collapsedGroups[category]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {tasks.messages.map((msg, index) => (
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
                                    {msg.toString()}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </Box>
                  )
                }
                )}
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
