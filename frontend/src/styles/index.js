import { makeStyles, withStyles } from "@material-ui/core/styles";
import { lightGreen, blueGrey } from "@material-ui/core/colors";
import { ListItem as MuiListItem } from "@material-ui/core";

const drawerWidth = 240;
export const appStyles = makeStyles((theme) => ({
  root: {
    display: "flex"
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  hide: {
    display: "none"
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end"
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(2),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: -drawerWidth
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0
  }
}));

export const ListItem = withStyles({
  root: {
    "&$selected": {
      backgroundColor: "#264360",
      color: "#fff",
      "& .MuiListItemIcon-root": {
        color: "#fff"
      }
    },
    "&$selected:hover": {
      backgroundColor: "#264360",
      color: "#fff",
      "& .MuiListItemIcon-root": {
        color: "#fff"
      }
    },
    "&:hover": {
      backgroundColor: "#EBECF4",
      color: "black",
      "& .MuiListItemIcon-root": {
        color: "#000"
      }
    }
  },
  selected: {}
})(MuiListItem);

export const homeStyles = makeStyles((theme) => ({
    root: {
      width: "100%",
      transform: "rotate(0deg)",
      backgroundColor: "rgb(245, 240, 237)",
      "& .Mui-expanded": {
        backgroundColor: "rgb(245, 240, 237)",
        "& .MuiFilledInput-input": {
          backgroundColor: "rgb(248, 250, 252)"
          // backgroundColor: "rgb(250, 241, 232)"
        }
      }
    },
    accordion: {
      minHeight: 150, //ugly but works
      height: "100%"
    },
    heading: {
      fontSize: theme.typography.pxToRem(15)
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary
    },
    details: {
      alignItems: "center",
      border: "1px solid rgba(0,0,0,0.1)",
      borderRadius: 4
    },
    column: {
      flexBasis: "33.33%"
    },
    helper: {
      padding: theme.spacing(1, 2)
    },
    containedLightGreen: {
      color: theme.palette.getContrastText(lightGreen[500]),
      backgroundColor: lightGreen[500],
      "&:hover": {
        backgroundColor: lightGreen[700],
        "@media (hover: none)": {
          backgroundColor: lightGreen[500]
        }
      }
    },
    containedBlueGrey: {
      color: theme.palette.getContrastText(blueGrey[500]),
      backgroundColor: blueGrey[500],
      "&:hover": {
        backgroundColor: blueGrey[700],
        "@media (hover: none)": {
          backgroundColor: blueGrey[500]
        }
      }
    }
  }));

export const commentStyles = makeStyles({
  link: {
    // color: 'white',
    position: 'relative',
    "&:hover:not(.Mui-disabled)": {
      cursor: "pointer",
      border: "none",
      color: "gray"
    },
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '0',
      height: '2px',
      bottom: '-3px',
      left: '50%',
      transform: 'translate(-50%,0%)',
      // backgroundColor: 'red',
      visibility: 'hidden',
      transition: 'all 0.3s ease-in-out',
    },
    '&:hover:before': {
      visibility: 'visible',
      width: '100%',
    },
  },
});

export const adminHomeStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    transform: "rotate(0deg)",
    backgroundColor: "rgb(245, 240, 237)",
    "& .Mui-expanded": {
      backgroundColor: "rgb(245, 240, 237)",
      "& .MuiFilledInput-input": {
        backgroundColor: "rgb(248, 250, 252)"
        // backgroundColor: "rgb(250, 241, 232)"
      }
    }
  },
  accordion: {
    minHeight: 150, //ugly but works
    height: "100%"
  },
  heading: {
    fontSize: theme.typography.pxToRem(15)
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  },
  details: {
    alignItems: "center",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 4
  },
  column: {
    flexBasis: "33.33%"
  },
  helper: {
    padding: theme.spacing(1, 2)
  },
  containedLightGreen: {
    color: theme.palette.getContrastText(lightGreen[500]),
    backgroundColor: lightGreen[500],
    "&:hover": {
      backgroundColor: lightGreen[700],
      "@media (hover: none)": {
        backgroundColor: lightGreen[500]
      }
    }
  },
  containedBlueGrey: {
    color: theme.palette.getContrastText(blueGrey[500]),
    backgroundColor: blueGrey[500],
    "&:hover": {
      backgroundColor: blueGrey[700],
      "@media (hover: none)": {
        backgroundColor: blueGrey[500]
      }
    }
  }
}));