import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress
} from '@mui/material';
import { IconButton } from "@material-ui/core";
import {
  FcExpand as ExpandMoreIcon
} from "react-icons/fc"
import {
  RiDeleteBin5Fill as  DeleteIcon,
  RiEditLine as RiEditLineIcon,
  RiAddBoxFill
} from "react-icons/ri"
//  RiEditLine
import {
  AiFillFolder as FolderIcon
} from "react-icons/ai"

import _ from "lodash"
import { useQuery, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { queryManageLotterys, mutationManageLottery } from "../apollo/gqlQuery"
import { getHeaders, handlerErrorApollo, showToast } from "../util"

const ManageLotterysPage = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const [expanded, setExpanded] = useState(true)
  const [data, setData] = useState([])

  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });
  const [onMutationManageLottery, resultMutationManageLotteryValues] = useMutation(mutationManageLottery
    , {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {manageLottery}} ) => {
          let { status, input } = manageLottery
          if(status){
            let queryManageLotterysValue = cache.readQuery({ query: queryManageLotterys });
            if(queryManageLotterysValue){
              let filterData = _.filter(queryManageLotterysValue.manageLotterys.data, (v)=>v._id !== input._id)
              cache.writeQuery({
                query: queryManageLotterys,
                data: { manageLotterys: {...queryManageLotterysValue.manageLotterys, data: filterData } },
              });
            }
          }
        },
        onCompleted(data) {
          showToast("info", `ลบเรียบร้อย`)
        },
        onError(error){
          return handlerErrorApollo( props, error )
        }
      }
  );

  const { loading: loadingManageLotterys, 
          data: dataManageLotterys, 
          error: errorManageLotterys       } =  useQuery(queryManageLotterys, {
                                                context: { headers: getHeaders(location) },
                                                fetchPolicy: 'cache-first', 
                                                nextFetchPolicy: 'network-only', 
                                                notifyOnNetworkStatusChange: false,
                                              });

  useEffect(() => {
    if(!loadingManageLotterys){
      if(!_.isEmpty(dataManageLotterys?.manageLotterys)){
        let { status, data: newData } = dataManageLotterys.manageLotterys
        if(status) setData(newData)
      }
    }
  }, [dataManageLotterys, loadingManageLotterys])

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false });
  };

  return (
    <div className="user-list-container">
      {
        <div className="col-lg-6 col-12">
          <div className="row">
            <div className="col-lg-12 col-12">
              <Accordion 
                expanded={expanded}
                onChange={(event, isExpanded)=>{
                  setExpanded(isExpanded)
                }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header">
                    <Typography>หวยทั้งหมด ({data.length})
                        <IconButton onClick={(evt)=> navigate('/manage-lottery',{state:{from: "/", mode: "new"}}) }>
                            <RiAddBoxFill />
                        </IconButton>
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        {
                            loadingManageLotterys 
                            ?  <LinearProgress />
                            :  _.map( data, (value, index)=>{
                                console.log("value :", value)
                                var local_start = moment(moment.utc(value?.start_date_time).toDate()).local().format('DD MMM, YYYY HH:mm');
                                var local_end = moment(moment.utc(value?.end_date_time).toDate()).local().format('DD MMM, YYYY HH:mm');

                                return  <ListItem
                                          key={index}
                                          secondaryAction={
                                            <div>
                                              <IconButton 
                                                edge="end" 
                                                aria-label="delete"
                                                onClick={(evt)=> navigate('/manage-lottery',{state:{from: "/", mode: "edit", _id: value?._id}}) }>
                                                <RiEditLineIcon />
                                              </IconButton>
                                              <IconButton 
                                                edge="end" 
                                                aria-label="delete"
                                                onClick={(evt)=>{
                                                  setOpenDialogDelete({...openDialogDelete, isOpen: true, id: value?._id, description: value?.title})
                                                }} >
                                                <DeleteIcon />
                                              </IconButton>
                                            </div>
                                          }>
                                          <ListItemAvatar>
                                              <Avatar><FolderIcon /></Avatar>
                                          </ListItemAvatar>
                                          <ListItemText
                                              primary={ value?.title +" : "+ local_start + " - " +  local_end }
                                              secondary={ "ผลการออกรางวัล : " +value?.bon + "(บน) - " + value?.lang + "(ล่าง)"}
                                          />
                                        </ListItem>
                            })
                        }
                    </List>
                </AccordionDetails>
              </Accordion>
            </div>
          </div>
        </div>
      }
      {openDialogDelete.isOpen && (
        <Dialog
          open={openDialogDelete.isOpen}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description">
          <DialogTitle id="alert-dialog-title">{t("confirm_delete")}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{openDialogDelete.description}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <button
              variant="outlined"
              onClick={() => {
                onMutationManageLottery({ variables: { input: {mode: "delete", _id: openDialogDelete.id, title: openDialogDelete.description, start_date_time: new Date() , end_date_time: new Date() } } })
                setOpenDialogDelete({ isOpen: false, id: "", description: "" });
              }}
            >{t("delete")}</button>
            <button variant="contained" onClick={handleClose} autoFocus>{t("close")}</button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};
export default ManageLotterysPage;
