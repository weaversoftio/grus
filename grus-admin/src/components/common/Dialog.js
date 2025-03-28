import { DialogActions, DialogContent, DialogTitle, Dialog as MuiDialog } from "@mui/material"

const DialogComponent = ({
  children,
  title = '',
  open = false,
  onClose = () => null,
  renderButtons = null,
  paperProps={}
}) => (
  <MuiDialog
    open={open}
    onClose={onClose}
    PaperProps={{ sx: { paddingBlockEnd: '1rem',  flexGrow: 1, maxWidth: 800, ...paperProps } }}>
    <DialogTitle variant='h5' >{title}</DialogTitle>
    <DialogContent>
      {children}
    </DialogContent>
    {renderButtons && <DialogActions style={{marginRight: 18}}>
      {renderButtons()}
    </DialogActions>}
  </MuiDialog>
)

export default DialogComponent;