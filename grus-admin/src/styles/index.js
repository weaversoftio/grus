import { makeStyles } from '@mui/styles';
import { blue, green, orange, red, grey } from '@mui/material/colors';

export const useClasses = () => makeStyles(theme => ({
  button: {
    width: "30rem", 
    padding: 15, 
    fontWeight: "bold"
  },
  tableHead: {
    background: 'lightgray',
    fontWeight: 'bold'
  },
  tableBody: {
    background: '#eff0f2',
  },
  tableCellRoot: {
    maxWidth: "50px",
    padding: 7,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: "hidden"
  },
  screenHeader: {
    background: '#3f51b5',
    color: '#fff',
    padding: '0 10px',
    marginBottom: 20
  },
  screenContainer: {
    padding: '0px 24px 24px 24px'
  },
  textField: { 
    marginBottom: 10
  },
  dialogButtons: {
    float: 'right',
    '&>*': {
      marginInlineStart: '5px'
    }
  },
  dialogPaper: {
    padding: 20
  },
  dialogCloseButton: {
    position: 'absolute',
    top: 0,
    right: 5
  },
  dialogActions: {
    paddingInlineEnd: 24,
    paddingBottom: 24
  },
  dialogTitle: {
    fontWeight: 'bold',
    marginBottom: 10

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
    width: 30,
    '& .MuiTextField-root': {
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
  totalCount: {
    position: 'absolute',
    right: 25,
    marginBottom: 10
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
  actionButton: {
    margin: '0px 5px 0px 5px',
    padding: 0
  },
  w200: {
    maxWidth: 200
  },
  urgentField: {
    padding: '2.5px 14px',
    minWidth: 20
  },
  searchInputs: {
    padding: '8.5px 14px',
    minWidth: 100
  },
  mt20: {
    marginTop: 20
  },
  mb20: {
    marginBottom: 20
  },
  p0: {
    padding: 0
  },
  bold: {
    fontWeight: 'bold',
  },
  txtWhite: {
    color: 'white'
  },
  hidden: {
    display: 'none'
  },
  floatRight: {
    float: 'right'
  },
  containerScreen: {
    marginTop: 100
  },
  colorRed: {
    color: red[600]
  },
  bgGreen: {
    background: green[200]
  },
  bgGreen100: {
    background: green[50]
  },
  bgOrange: {
    background: orange[200]
  },
  bgOrange100: {
    background: orange[50]
  },
  bgBlue: {
    backgroundColor: blue[200]
  },
  bgBlue100: {
    backgroundColor: blue[50]
  },
  bgRed: {
    backgroundColor: red[300]
  },
  bgRed100: {
    backgroundColor: red[100]
  }

}))