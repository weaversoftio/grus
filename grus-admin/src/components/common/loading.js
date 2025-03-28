import { Box, CircularProgress, Typography } from "@mui/material"

export const Loading = ({text="Loading"}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '80vh',
        width: '100%',
        textAlign: 'center'
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: 'primary.main',
          animation: 'pulse 1.5s ease-in-out infinite',
          '@keyframes pulse': {
            '0%': {
              opacity: 0.5,
              transform: 'scale(0.95)'
            },
            '50%': {
              opacity: 1,
              transform: 'scale(1.05)'
            },
            '100%': {
              opacity: 0.5,
              transform: 'scale(0.95)'
            }
          }
        }}
      />
      <Typography
        variant="h6"
        sx={{
          mt: 3,
          fontWeight: 300,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          opacity: 0.8
        }}
      >
        {text}
      </Typography>
    </Box>
  )
}
