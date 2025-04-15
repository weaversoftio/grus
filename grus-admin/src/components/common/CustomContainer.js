import { Box, Typography } from "@mui/material"

export const CustomerContainer = ({ title, subtitle, children }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        {title && <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          {title}
        </Typography>}
        {subtitle && <Typography variant="subtitle1" color="text.secondary">
          {subtitle}
        </Typography>}
      </Box>
      {children}

    </Box>
  )
}