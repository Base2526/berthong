import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { DeleteForever as DeleteForeverIcon, 
        Edit as EditIcon, 
        ExitToApp as ExitToAppIcon } from '@mui/icons-material';
import {
  Stack,
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  SpeedDial,
  SpeedDialIcon,
  Box
} from '@mui/material'
import InfiniteScroll from "react-infinite-scroll-component";
import _ from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, createSearchParams } from "react-router-dom";

import { queryUsers } from "./gqlQuery";
import { getHeaders, handlerErrorApollo } from "./util";
import RolesComp from "./components/RolesComp"
// import * as Constants from "./constants";

const UsersPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  let [input, setInput] = useState({ OFF_SET: 0, LIMIT: 20 })

  let [datas, setDatas] = useState([]);
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true);

  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  const { loading: loadingUsers, 
          data: dataUsers, 
          error: errorUsers, 
          networkStatus: networkStatusUsers,
          fetchMore: fetchMoreUsers } = useQuery(queryUsers, 
                                        { 
                                          context: { headers: getHeaders(location) }, 
                                          variables: {input},
                                          fetchPolicy: 'network-only', 
                                          nextFetchPolicy: 'cache-first', 
                                          notifyOnNetworkStatusChange: true
                                        }
                                      );

  if(!_.isEmpty(errorUsers)) handlerErrorApollo( props, errorUsers )

  useEffect(() => {
    if(!loadingUsers){
      if(!_.isEmpty(dataUsers?.users)){
        let { status, total, data } = dataUsers?.users
        if(status){
          setDatas(data)
          setTotal(total)
        }

        setLoading(false)
      }
    }
  }, [dataUsers, loadingUsers])

  const handleDelete = (id) => {
  };

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false, description: "" });
  };

  const fetchMoreData = async() =>{
    let mores =  await fetchMoreUsers({ variables: { input: {...input, OFF_SET:input.OFF_SET + 1} } })
    let {status, data} =  mores.data.users
    // console.log("status, data :", status, data)
   
    if(slice === total){
      setHasMore(false);
    }else{
      setTimeout(() => {
        let newDatas = [...datas, ...data]
        setDatas(newDatas)
        setSlice(newDatas.length);
      }, 1000); 
    }
  }

  return (
    <div className="pl-2 pr-2">
        {
          loading
          ?  <CircularProgress />
          :  datas?.length == 0 
              ?   <label>Empty data</label>
              :   <InfiniteScroll
                      dataLength={slice}
                      next={fetchMoreData}
                      hasMore={hasMore}
                      loader={<h4>Loading...</h4>}>
                      { 
                      _.map(datas, (item, index) => {                       
                        let _id         = item._id;
                        let avatar      = item.avatar;
                        let displayName = item.displayName;
                        let username    = item.username;
                        let email       = item.email;
                        let roles       = item.roles;
                        let lastAccess  = item.lastAccess;

                        return <Stack direction="row" spacing={2} >
                                  <Box sx={{ width: '8%' }}>
                                    <Avatar
                                      alt="Example avatar"
                                      variant="rounded"
                                      src={avatar?.url}
                                      // onClick={(e) => {
                                      //   // onLightbox({ isOpen: true, photoIndex: 0, images:files })
                                      // }}
                                      sx={{ width: 56, height: 56 }}
                                    />
                                  </Box>
                                  <Box 
                                    sx={{ width: '8%' }}
                                    onClick={()=>{
                                      navigate({ pathname: `/p`, search: `?${createSearchParams({ id: _id })}` })
                                    }}>{displayName}</Box>
                                  <Box sx={{ width: '10%' }}>{username}</Box>
                                  <Box sx={{ width: '20%' }}>{email}</Box>
                                  <Box sx={{ width: '15%' }}> {/*{roles.join(',')}*/} <RolesComp Ids={roles}/> </Box>
                                  <Box sx={{ width: '5%' }}>{ (moment(lastAccess, 'YYYY-MM-DD HH:mm')).format('DD MMM, YYYY HH:mm')}</Box>
                                  <Box sx={{ width: '20%' }}>
                                    <button onClick={(e)=>{ console.log("Force logout") }}><ExitToAppIcon />Force logout</button>
                                    <button onClick={()=>{ navigate("/user", {state: {from: "/", mode: "edit", id: _id}}) }}><EditIcon/>{t("edit")}</button>
                                    <button onClick={(e)=>{ setOpenDialogDelete({ isOpen: true, id: _id, description: displayName }) }}><DeleteForeverIcon/>{t("delete")}</button>
                                  </Box>
                              </Stack>
                      })
                    }
                  </InfiniteScroll>
        }
      
        {openDialogDelete.isOpen && (
          <Dialog
            open={openDialogDelete.isOpen}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{t("confirm_delete")}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {openDialogDelete.description}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                onClick={() => {
                  handleDelete(openDialogDelete.id);

                  setOpenDialogDelete({ isOpen: false, id: "", description: "" });
                }}
              >{t("delete")}</Button>
              <Button variant="contained" onClick={handleClose} autoFocus>{t("close")}</Button>
            </DialogActions>
          </Dialog>
        )}
        <SpeedDial
          ariaLabel="SpeedDial basic example"
          sx={{ position: 'absolute', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          onClick={(e)=>{ navigate({ pathname: "/user", state: {from: "/", mode: "new" } }) }}/>
    </div>
  );
};

export default UsersPage;
