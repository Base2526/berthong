import React, { useContext, useState } from 'react'
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import { createSearchParams, useNavigate } from "react-router-dom";
import { 
        IconButton,
        Menu,
        MenuItem,
        Button,
        Dialog,
        DialogActions,
        DialogContent,
        DialogContentText,
        DialogTitle,
        Typography,
        Avatar,
        LinearProgress
      } from '@mui/material'
import { useQuery } from "@apollo/client";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import _ from 'lodash';
import { t } from 'i18next';

import { ActionContext } from './ActionContext'
import { queryUserById } from "../../apollo/gqlQuery"
import { getHeaders } from "../../util"
import { commentStyles } from "../../styles"

const CommentStructure = (props) => {
  let navigate = useNavigate();
  let location = useLocation();
  let { t } = useTranslation();
  let classes = commentStyles();
  let actions = useContext(ActionContext)
  let edit = true
  let [anchorEl, setAnchorEl] = useState(null);
  let [openDialog, setOpenDialog] = React.useState(false);

  let { user:currentUser, i, reply, parentId } = props

  console.log("CommentStructure props :", props, currentUser)

  const handleClickOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = (event, reason) => {
    setOpenDialog(false);
  };

  const handleAnchorOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAnchorClose = (event) => {
    setAnchorEl(null);
  };

  const dialogDelete = () =>{
    return  <Dialog
              open={openDialog}
              // onClose={handleCloseDialog}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                Delete Comment
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                Delete your comment permanently?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                {/* <Button  variant="outlined" onClick={()=>{
                  handleCloseDialog()
                  actions.onDelete(i.comId, parentId)
                }} autoFocus>
                  Delete
                </Button> */}

                <Button variant="outlined"  onClick={()=>{
                  handleCloseDialog()
                  actions.onDelete(i.comId, parentId)
                }} startIcon={<DeleteIcon />}>
                  Delete
                </Button>
                <Button variant="contained" onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </Dialog>
  }

  const onLoadProfile = () =>{
    const { loading: loadingUserById, 
            data: dataUserById, 
            error: errorUserById,
            refetch: refetchUserById } = useQuery(queryUserById, { 
                                                                context: { headers: getHeaders(location) },
                                                                variables: {id:  i?.userId},
                                                                fetchPolicy:'cache-first', 
                                                                nextFetchPolicy:'network-only',
                                                                notifyOnNetworkStatusChange: true 
                                                              });

    if(loadingUserById){
      return  <div>
                <Avatar className={classes.link} src={""} alt="userIcon" />
                <LinearProgress />
              </div>
    }
  
    let {status, data:user}  = dataUserById?.userById
    if(status){
      return  <div className='d-flex avartar-comment'>
                  <Avatar className={classes.link + " p-1 m-1"} src={user?.avatar?.url} sx={{ width: 24, height: 24 }} alt="userIcon" />
                  <div>
                     <Typography 
                      className={classes.link} 
                      variant="subtitle2" 
                      gutterBottom 
                      component="div"
                      onClick={(evt)=>{
                        if(!_.isEqual(currentUser._id, user._id)){
                          navigate({
                            pathname: `/p`,
                            search: `?${createSearchParams({ id: user._id})}`
                          })
                        }
                      }}><b>{ user?.displayName }</b></Typography>
                     {
                      actions.user 
                      ? <div className='days'>
                          <Typography variant="caption" gutterBottom component="div">{ moment(new Date(i.updated)).fromNow()  /*moment.unix(i.updated / 1000).fromNow()*/}</Typography>
                        </div>
                      : <div className='days'><Typography variant="caption" gutterBottom component="div" style={{ marginLeft: '.5rem' }}>{' '}{ moment(new Date(i.updated)).fromNow() /*moment.unix(i.updated / 1000).fromNow()*/ }</Typography></div>
                    }
                  </div>
                </div>
    }else{
      return  <div className='d-flex avartar-comment'>
                <Avatar className={classes.link + " p-1 m-1"} src={""} sx={{ width: 24, height: 24 }} alt="userIcon" />
                <Typography className={classes.link} variant="subtitle2" gutterBottom component="div"></Typography>
                {
                  actions.user 
                  ? <div className='days'>
                      <Typography variant="caption" gutterBottom component="div">{ moment(new Date(i.updated)).fromNow()  /*moment.unix(i.updated / 1000).fromNow()*/}</Typography>
                    </div>
                  : <div className='days'><Typography variant="caption" gutterBottom component="div" style={{ marginLeft: '.5rem' }}>{' '}{ moment(new Date(i.updated)).fromNow() /*moment.unix(i.updated / 1000).fromNow()*/ }</Typography></div>
                }
              </div>
    }
  }

  return (
    <div className={"halfDiv"}>
      <div className={"userInfo"} style={reply && { marginLeft: 15, marginTop: '6px' }} >
        <div className={"commentsTwo"}>
          {onLoadProfile()}
          {/* {
            actions.user 
            ? <div>
                <IconButton aria-label="reply" className={"replyBtn"}
                  onClick={() => actions.handleAction(i.comId)}
                  disabled={!actions.user}>
                  <ReplyIcon/>Reply
                </IconButton>
                <Typography variant="caption" gutterBottom component="div">{ moment(new Date(i.updated)).fromNow() }</Typography>
              </div>
            : <Typography variant="caption" gutterBottom component="div" style={{ marginLeft: '.5rem' }}>{' '}{ moment(new Date(i.updated)).fromNow() }</Typography>
          } */}
        </div>
        {/* <Typography variant="subtitle1" gutterBottom component="div">{i.text} </Typography> */}

        <div className='comment-pl'>
          <Typography 
            variant="subtitle1" 
            gutterBottom 
            component="div"
            dangerouslySetInnerHTML={{ __html: i.text }}/>
        </div>
        <div className='reply-btn p-1'>
              {
                  actions.user 
                  ? 
                      <IconButton aria-label="reply" className={"replyBtn"}
                        onClick={() => actions.handleAction(i.comId)}
                        disabled={!actions.user}>
                        <ReplyIcon/>Reply
                      </IconButton>
                    
                  :null 
              }
        </div>
      </div>
      <div className={"userActions"}>
        {actions.userId === i.userId && actions.user && (
           <IconButton aria-label="share">
           <MoreVertIcon
             onClick={handleAnchorOpen}
           />
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={
                Boolean(anchorEl)
              }
              onClose={handleAnchorClose}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center"
              }}
              MenuListProps={{
                "aria-labelledby": "lock-button",
                role: "listbox"
              }}
            >
              <MenuItem onClick={()=>{
                actions.handleAction(i.comId, edit)
                handleAnchorClose()
              }}>
                {t("edit")}
              </MenuItem>
              <MenuItem onClick={(ev)=>{
                // actions.handleAction(i.comId, edit)
                handleClickOpenDialog(ev)
                handleAnchorClose()
              }}>
                {t("delete")}
              </MenuItem>
            </Menu>
            
            {dialogDelete()}
           </IconButton>
        )}
      </div>
    </div>
  )
}

export default CommentStructure
