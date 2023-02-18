import React, { useState, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import 'react-toastify/dist/ReactToastify.css';
import _ from "lodash"
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import LinearProgress from '@mui/material/LinearProgress';
import queryString from 'query-string';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from "@mui/material/Avatar";
import CardActionArea from "@material-ui/core/CardActionArea";
import Box from "@mui/material/Box";
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import { getHeaders, checkRole } from "./util"
import { queryUserById, querySupplierProfile } from "./gqlQuery"
import { login, logout } from "./redux/actions/auth"
import { AMDINISTRATOR, AUTHENTICATED } from "./constants"
import Table from "./TableContainer"
import ReadMoreMaster from "./ReadMoreMaster"

const SupplierProfilePage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    let [pageOptions, setPageOptions] = useState([30, 50, 100]);  
    let [pageIndex, setPageIndex]     = useState(0);  
    let [pageSize, setPageSize]       = useState(pageOptions[0])
    const [lightbox, setLightbox]       = useState({ isOpen: false, photoIndex: 0, images: [] });

    let params = queryString.parse(location.search)
    
    let { user } = props

    console.log("params :", params)
    if(_.isEmpty(params.u)){
        // history.push({ pathname: "/" });
        navigate(-1)
        return;
    }

    let profileValue;
    // let profileValue = useQuery(querySupplierProfile, {
    //     context: { headers: getHeaders(location) },
    //     variables: {id: params.u},
    //     notifyOnNetworkStatusChange: true,
    // });

    console.log("profileValue :", profileValue)


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
            
                        console.log("files :", props.value)
                        
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
                                console.log("files props: ", props.value)
                                setLightbox({ isOpen: true, photoIndex: 0, images:props.value })
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
                        return ( <div style={{ position: "relative" }} 
                                    onClick={()=>{
                                    // history.push({
                                    //     pathname: "/p",
                                    //     search: `?id=${_id}`,
                                    //     state: { id: _id }
                                    // });
                                    navigate({
                                        pathname: "/p",
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
                    Header: 'จำนวนที่ขายได้',
                    accessor: 'buys',
                    Cell: props => {
                        let {buys} = props.row.original            
                        return <div>{buys.length}</div>
                    }
                },
            ] 
        } ,
        []
    )

    // const [data, setData] = useState(() => makeData(10000))
    // const [originalData] = useState(data)

    // We need to keep the table from resetting the pageIndex when we
    // Update data. So we can keep track of that flag with a ref.
    const skipResetRef = useRef(false)

    // When our cell renderer calls updateMyData, we'll use
    // the rowIndex, columnId and new value to update the
    // original data
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
    //////////////////////
    //////////////////////
    
    if(profileValue.loading){
        return <CircularProgress />
    }

    console.log("profileValue :", profileValue)

    let { status, data } = profileValue.data.supplierProfile

    console.log("status, data : ", status, data)

    return (<div style={{flex:1}}>
                <Avatar
                    className={"user-profile"}
                    sx={{
                        height: 80,
                        width: 80
                    }}
                    variant="rounded"
                    alt="Example Alt"
                    // src={_.isEmpty(data.image) ? "" : data.image[0].url }
                    />
                <div> Name : {data.displayName}</div>
                <div>
                    <Table
                    columns={columns}
                    data={data.suppliers}
                    fetchData={fetchData}
                    rowsPerPage={pageOptions}
                    updateMyData={updateMyData}
                    skipReset={skipResetRef.current}
                    isDebug={false}
                    />
                </div>
            </div>);
    }

const mapStateToProps = (state, ownProps) => {
    return { user:state.auth.user }
};

const mapDispatchToProps = { login, logout }

export default connect( mapStateToProps, mapDispatchToProps )(SupplierProfilePage);