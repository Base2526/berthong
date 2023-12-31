import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
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

import { queryUsers, mutationForceLogout } from "../apollo/gqlQuery";
import { getHeaders, handlerErrorApollo, showToast } from "../util";
import RolesComp from "../components/RolesComp"
import * as Constants from "../constants";

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

  const [onMutationForceLogout, resultMutationForceLogout] = useMutation(mutationForceLogout,
    {
      context: { headers: getHeaders(location) },
      update: (cache, {data: {forceLogout}}, context ) => {
        console.log("forceLogout :", forceLogout)
        let { status } = forceLogout

        if(status){
          switch(context?.variables?.input?.mode.toLowerCase()){
            case "all":{
              let { _id } = context?.variables?.input
              let queryUsersValue = cache.readQuery({ query: queryUsers, variables: { input } });
              if(!_.isEmpty(queryUsersValue)){

                let newData = _.map(queryUsersValue.users.data, (v)=>{
                                if(v?.session){
                                  return  _.omit(v, ['session'])
                                }
                                return v
                              }) 

                cache.writeQuery({
                  query: queryUsers,
                  variables: { input },
                  data: Object.assign({}, queryUsersValue, { users: {...queryUsersValue.users, data: newData } } )
                });
              }
              break;
            }
    
            case "id":{
              let { _id } = context?.variables?.input
              let queryUsersValue = cache.readQuery({ query: queryUsers, variables: { input } });
              if(!_.isEmpty(queryUsersValue)){

                let newData = _.map(queryUsersValue.users.data, (v)=>{
                                if(v?.session && _.isEqual(v?.session?._id.toString(), _id.toString())){
                                  return  _.omit(v, ['session'])
                                }
                                return v
                              }) 

                cache.writeQuery({
                  query: queryUsers,
                  variables: { input },
                  data: Object.assign({}, queryUsersValue, { users: {...queryUsersValue.users, data: newData } } )
                });
              }
              break;
            }
          }
        }
        
        // let { status, input } = manageLottery
        // if(status){
        //   let queryManageLotterysValue = cache.readQuery({ query: queryManageLotterys });
        //   if(queryManageLotterysValue){
        //     let filterData = _.filter(queryManageLotterysValue.manageLotterys.data, (v)=>v._id !== input._id)
        //     cache.writeQuery({
        //       query: queryManageLotterys,
        //       data: { manageLotterys: {...queryManageLotterysValue.manageLotterys, data: filterData } },
        //     });
        //   }
        // }
      },
      onCompleted(data) {
        showToast("info", `ลบเรียบร้อย`)
      },
      onError(error){
        return handlerErrorApollo( props, error )
      }
    }
  );

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
              :   <div>
                    <button onClick={(e)=>{ onMutationForceLogout({ variables: { input: { mode: "all" } } }) }}><ExitToAppIcon />Force logout all</button>
                    <InfiniteScroll
                        dataLength={slice}
                        next={fetchMoreData}
                        hasMore={hasMore}
                        loader={<h4>Loading...</h4>}>
                        { 
                        _.map(datas, (item, index) => {            
                          let { _id,  avatar, displayName, username, email, roles, lastAccess, transition, session } = item

                          let money_deposit = 0
                          let money_withdraw = 0
                          if(!_.isEmpty(transition)){
                            _.map(transition, (tra)=>{
                              switch(tra.type){
                                case Constants.SUPPLIER:{
                                  let {supplier} = tra

                                  if(supplier !== undefined){
                                    console.log("supplier: ", supplier)
                                  }
                                  break;
                                }
                                case Constants.DEPOSIT:{
                                  let {status, deposit} = tra
                                  if( status === Constants.APPROVED && deposit !== undefined){
                                    money_deposit += deposit?.balance
                                  }
                                  break;
                                }
                                case Constants.WITHDRAW:{
                                  let {status, withdraw} = tra
                                  if( status === Constants.APPROVED && withdraw !== undefined){
                                    money_withdraw += withdraw?.balance
                                  }
                                  break;
                                }
                              }
                            })
                          }

                          return <Stack direction="row" spacing={2} >
                                    <Box sx={{ width: '8%' }}>
                                      <Avatar
                                        alt="Example avatar"
                                        variant="rounded"
                                        src={avatar?.url}
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
                                    <Box sx={{width: '10%'}}>{money_deposit}</Box>
                                    <Box sx={{width: '10%'}}>{money_withdraw}</Box>
                                    <Box sx={{ width: '15%' }}> {/*{roles.join(',')}*/} <RolesComp Ids={roles}/> </Box>
                                    {/* <Box sx={{ width: '5%' }}>{ (moment(new Date(lastAccess), 'YYYY-MM-DD HH:mm')).format('DD MMM, YYYY HH:mm')}</Box>
                                    <Box sx={{ width: '20%' }}>
                                      {
                                        !_.isUndefined(session)
                                        ? <button onClick={(e)=>{ onMutationForceLogout({ variables: { input: { mode: "id", _id: session._id } } }) }}><ExitToAppIcon />Force logout</button>
                                        : <div />
                                      }
                                      <button onClick={()=>{ navigate("/user", {state: {from: "/", mode: "edit", id: _id}}) }}><EditIcon/>{t("edit")}</button>
                                      <button onClick={(e)=>{ setOpenDialogDelete({ isOpen: true, id: _id, description: displayName }) }}><DeleteForeverIcon/>{t("delete")}</button>
                                    </Box> */}
                                </Stack>
                        })
                      }
                    </InfiniteScroll>
                  </div>
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
