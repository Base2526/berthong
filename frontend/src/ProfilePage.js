import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import queryString from 'query-string';
import CardActionArea from "@material-ui/core/CardActionArea";

import {
    Box,
    Stack,
    Avatar,
    CircularProgress,
    IconButton
} from '@mui/material';

import {
    SlUserFollow
} from "react-icons/sl"

import { getHeaders } from "./util"
import { queryProfile } from "./gqlQuery"
import { login, logout } from "./redux/actions/auth"
import TableComp from "./components/TableComp"
import ReadMoreMaster from "./ReadMoreMaster"

const ProfilePage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const { onLightbox } = props
    
    let [pageOptions, setPageOptions] = useState([30, 50, 100]);  
    let [pageIndex, setPageIndex]     = useState(0);  
    let [pageSize, setPageSize]       = useState(pageOptions[0])
    let [data, setData] = useState([]);
      
    let params = queryString.parse(location.search)
    if(_.isEmpty(params?.id)){
        navigate(-1)
        return;
    }

    const { loading: loadingProfile, 
            data: dataProfile, 
            error: errorProfile, 
            networkStatus } = useQuery( queryProfile, { 
                                        context: { headers: getHeaders(location) }, 
                                        variables: {id: params.id},
                                        fetchPolicy: 'network-only', // Used for first execution
                                        nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                        notifyOnNetworkStatusChange: true});

    useEffect(() => {
        if(!loadingProfile){
            if (dataProfile?.profile) {
                let { status, data } = dataProfile?.profile
                if(status){
                  setData(data)
                }
            }
        }
    }, [dataProfile, loadingProfile])

    ///////////////////////
    const fetchData = useCallback(({ pageSize, pageIndex }) => {
        setPageSize(pageSize)
        setPageIndex(pageIndex)
    })

    const columns = useMemo(
        () =>{
            return [
                {
                    Header: 'รูป',
                    accessor: 'files',
                    Cell: props =>{
                        if(props.value.length < 1){
                            return <div />
                        }
                        
                        return (
                        <div style={{ position: "relative" }}>
                            <CardActionArea style={{ position: "relative", paddingBottom: "10px" }}>
                            <Avatar
                                sx={{
                                height: 100,
                                width: 100
                                }}
                                variant="rounded"
                                alt="Example Alt"
                                src={props.value[0].url}
                                onClick={(e) => {
                                    onLightbox({ isOpen: true, photoIndex: 0, images:props.value })
                                }}
                            />
                            </CardActionArea>
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "5px",
                                    right: "5px",
                                    padding: "5px",
                                    backgroundColor: "#e1dede",
                                    color: "#919191"
                                }}
                                >{(_.filter(props.value, (v)=>v.url)).length}</div>
                        </div>
                        );
                    }
                },
                {
                    Header: 'ชื่อ',
                    accessor: 'title',
                    Cell: props =>{
                        let {_id, title} = props.row.original
                        return ( <div 
                                    className="card-title" 
                                    style={{ position: "relative" }} 
                                    onClick={()=>{
                                        navigate({
                                            pathname: "/d",
                                            search: `?${createSearchParams({ id: _id})}`,
                                            state: { id: _id }
                                        })
                                    }}>{title}</div> );
                    }
                },
                {
                    Header: 'Detail',
                    accessor: 'description',
                    Cell: props => {
                        return <Box
                                sx={{
                                maxHeight: "inherit",
                                width: "100%",
                                whiteSpace: "initial",
                                lineHeight: "16px"
                                }}>
                                <ReadMoreMaster
                                byWords={true}
                                length={10}
                                ellipsis="...">{props.value}
                                </ReadMoreMaster>
                            </Box>
                    }
                },
                {
                    Header: 'จำนวนที่ จอง-ขายได้',
                    accessor: 'buys',
                    Cell: props => {
                        let {buys} = props.row.original      
                        return <div>{(_.filter(buys, (buy)=>buy.selected == 0)).length}-{(_.filter(buys, (buy)=>buy.selected == 1)).length}</div>
                    }
                }
            ] 
        } ,
        []
    )

    // We need to keep the table from resetting the pageIndex when we
    // Update data. So we can keep track of that flag with a ref.
    const skipResetRef = useRef(false)

    // When our cell renderer calls updateMyData, we'll use
    // the rowIndex, columnId and new value to update the
    // original data
    const updateMyData = (rowIndex, columnId, value) => {
        skipResetRef.current = true
    }
    
    if( loadingProfile ){
        return <CircularProgress />
    }

    return (<div style={{flex:1}}>
                <Stack 
                    direction="row" 
                    spacing={2}>
                    <Avatar
                        className={"user-profile"}
                        sx={{ height: 80, width: 80 }}
                        variant="rounded"
                        alt="Example Alt"
                        src={_.isEmpty(data?.avatar) ? "" : data?.avatar?.url }/>
                    <div> Name : {data?.displayName}</div>    
                    <SlUserFollow size={"20px"} />
                </Stack>
                <TableComp
                    columns={columns}
                    data={_.isEmpty( data?.suppliers ) ? [] :  data?.suppliers }
                    fetchData={fetchData}
                    rowsPerPage={pageOptions}
                    updateMyData={updateMyData}
                    skipReset={skipResetRef.current}
                    isDebug={false}/>
            </div>);
    }

const mapStateToProps = (state, ownProps) => {
    return { user:state.auth.user }
}
const mapDispatchToProps = { login, logout }
export default connect( mapStateToProps, mapDispatchToProps )(ProfilePage);