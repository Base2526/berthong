import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { DeleteForever as DeleteForeverIcon, Edit as EditIcon, ExitToApp as ExitToAppIcon } from '@mui/icons-material';
import {
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  SpeedDial,
  SpeedDialIcon
} from '@mui/material'
import _ from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { queryUsers } from "./gqlQuery";
import Table from "./TableContainer";
import { getHeaders, showToast } from "./util";
import { AMDINISTRATOR, UNAUTHENTICATED } from "./constants";

const UsersPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  const [pageIndex, setPageIndex] = useState(0);  
  const [pageSize, setPageSize] = useState(pageOptions[0])
  const [datas, setDatas] = useState([])
  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  const { loading: loadingUsers, 
          data: dataUsers, 
          error: errorUsers, 
          networkStatus } = useQuery(queryUsers, 
                                      { 
                                        context: { headers: getHeaders(location) }, 
                                        fetchPolicy: 'network-only', // Used for first execution
                                        nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                        notifyOnNetworkStatusChange: true
                                      }
                                    );

  if(!_.isEmpty(errorUsers)){
    _.map(errorUsers?.graphQLErrors, (e)=>{
      switch(e?.extensions?.code){
        case UNAUTHENTICATED:{
          showToast("error", e?.message)
          break;
        }
      }
    })
  }

  useEffect(() => {
    if(!loadingUsers){
      if(!_.isEmpty(dataUsers?.users)){
        let { status, data } = dataUsers.users
        if(status)setDatas(data)
      }
    }
  }, [dataUsers, loadingUsers])

  // const [onDeleteUser, resultDeleteUser] = useMutation(gqlDeleteUser, 
  //   {
  //     update: (cache, {data: {deleteUser}}) => {
  //       const data1 = cache.readQuery({
  //         query: gqlUsers,
  //         variables: {page: pageIndex, perPage: pageSize},
  //       });

  //       let newUsers = {...data1.users}
  //       let newData   = _.filter(data1.users.data, user => user._id !== deleteUser._id)
  //       newUsers = {...newUsers, total: newData.length, data:newData }

  //       cache.writeQuery({
  //         query: gqlUsers,
  //         data: { users: newUsers },
  //         variables: {page: pageIndex, perPage: pageSize},
  //       });
  //     },
  //     onCompleted({ data }) {
  //       history.push("/users");
  //     }
  //   }
  // );
  // console.log("resultDeleteUser :", resultDeleteUser)

  const fetchData = useCallback(({ pageSize, pageIndex }) => {
    setPageSize(pageSize)
    setPageIndex(pageIndex) })

  const handleDelete = (id) => {
  };

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false, description: "" });
  };

  const columns = useMemo(
                          () => [
                            {
                              Header: 'Avatar',
                              accessor: 'avatar',
                              Cell: props =>{
                                let { avatar } = props.row.original
                                return (<Avatar sx={{ height: 100, width: 100 }} variant="rounded" src={ avatar?.url } />);
                              }
                            },
                            {
                              Header: 'Display name',
                              accessor: 'displayName',
                              Cell: props => {
                                let {_id, displayName} = props.row.original
                                return  <div onClick={()=>{
                                            navigate({
                                              pathname: "/user",
                                              state: {from: "/", mode: "edit", id: _id } 
                                            })
                                          }}>{displayName}</div>
                              }
                            },
                            {
                              Header: 'Username',
                              accessor: 'username',
                              Cell: props => {
                                let {_id, username} = props.row.original
                                return  <div onClick={()=>{
                                            navigate({
                                              pathname: "/user",
                                              state: {from: "/", mode: "edit", id: _id } 
                                            })
                                          }}>{username}</div>
                              }
                            },
                           
                            {
                              Header: 'Email',
                              accessor: 'email',
                            },
                            {
                              Header: 'Roles',
                              accessor: 'roles',
                              Cell: props => {
                                let {roles} = props.row.values
                                return <div>{roles.join(',')}</div>
                              }
                            },
                            {
                              Header: 'Last access',
                              accessor: 'lastAccess',
                              Cell: props =>{
                                let {lastAccess} = props.row.values 
                                return <div>{ (moment(lastAccess, 'YYYY-MM-DD HH:mm')).format('DD MMM, YYYY HH:mm')}</div>
                              }
                            },
                            {
                              Header: 'Action',
                              Cell: props => {
                                let {_id, displayName} = props.row.original
                                return  <div className="Btn--posts">
                                          <button onClick={(e)=>{
                                            console.log("Force logout")
                                          }}><ExitToAppIcon />Force logout</button>
                                          <button onClick={()=>{
                                            navigate("/user", {state: {from: "/", mode: "edit", id: _id } } )
                                            // navigate("/supplier", {state: {from: "/", mode: "edit", id: _id} })
                                          }}><EditIcon/>{t("edit")}</button>
                                          <button onClick={(e)=>{
                                            setOpenDialogDelete({ isOpen: true, id: _id, description: displayName });
                                          }}><DeleteForeverIcon/>{t("delete")}</button>
                                        </div>
                              }
                            },
                          ],
                          []
                        )

  const skipResetRef = useRef(false)
  const updateMyData = (rowIndex, columnId, value) => {
    console.log("updateMyData")
    // We also turn on the flag to not reset the page
    skipResetRef.current = true
    // setData(old =>
    //   old.map((row, index) => {
    //     if (index === rowIndex) {
    //       return {
    //         ...row,
    //         [columnId]: value,
    //       }
    //     }
    //     return row
    //   })
    // )
  }

  return (
    <div className="pl-2 pr-2">
        {
          loadingUsers
          ? <div><CircularProgress /></div> 
          : <Table
              columns={columns}
              data={datas}
              fetchData={fetchData}
              rowsPerPage={pageOptions}
              updateMyData={updateMyData}
              skipReset={skipResetRef.current}
              isDebug={false}
            />
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
          onClick={(e)=>{
            // history.push({ 
            //   pathname: "/user", 
            //   state: {from: "/", mode: "new" } 
            // });
            navigate({
              pathname: "/user",
              state: {from: "/", mode: "new" } 
            })
          }}/>
    </div>
  );
};

export default UsersPage;
