import { DialogContent, DialogActions, Dialog, DialogTitle } from '@mui/material';
import Button from '@mui/material/Button';

export const SimpleDialog = ({ open, title = "Default Title", children, handleClose, handleAgree}) => {

    return (
        <Dialog onClose={handleClose} open={open} maxWidth="lg">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent style={{scrollbarWidth: 'thin'}} dividers>
            {children}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
                {handleAgree &&
                    <Button onClick={handleClose}>Agree</Button>
                }
            </DialogActions>
        </Dialog>
    );
}