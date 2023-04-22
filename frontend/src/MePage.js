import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import queryString from 'query-string';
import { useTranslation } from "react-i18next";
import { createSearchParams, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
    Avatar,
    Typography 
} from '@mui/material';
import {
    AiFillCamera as CameraIcon,
    AiOutlineZoomIn as ZoomInIcon
} from "react-icons/ai" 
import {
    RiAddBoxFill
} from "react-icons/ri"
import { IconButton, LinearProgress } from "@material-ui/core";
import _ from "lodash"
import { styled } from "@mui/material/styles";



import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// import Avatar from '@mui/material/Avatar';
// import IconButton from '@mui/material/IconButton';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
// import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
// import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { AMDINISTRATOR, AUTHENTICATED } from "./constants";
import { queryBanks } from "./gqlQuery";
import { checkRole, getHeaders } from "./util";
import AutoGenerationContent from "./AutoGenerationContent";
const Input = styled("input")({ display: "none" });

const MePage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const params = queryString.parse(location.search)
    const { user, onDialogDeleteBank, onLightbox } = props

    const [banks, setBanks] = useState([])
    const [expanded, setExpanded] = useState(false)

    const { loading: loadingBanks, 
            data: dataBanks, 
            error: errorBanks, 
            networkStatus } = useQuery(queryBanks, 
                                        { 
                                            context: { headers: getHeaders(location) }, 
                                            fetchPolicy: 'cache-first', 
                                            nextFetchPolicy: 'network-only',
                                            notifyOnNetworkStatusChange: true
                                        }
                                        );

    useEffect(() => {
        if(!loadingBanks){
            if(!_.isEmpty(dataBanks?.banks)){
                let { status, data } = dataBanks?.banks
                if(status){
                    setBanks(data)
                }
            }
        }
    }, [dataBanks, loadingBanks])

    const managementView = () =>{
        switch(checkRole(user)){
            case AMDINISTRATOR:{
                return  <div>
                            <div className="div-management">
                                <div>Management</div>
                                <div>
                                    <button onClick={()=>{ 
                                        navigate("/withdraws");
                                    }}>รายการถอดเงิน รออนุมัติ</button>
                                </div>
                                <div>
                                    <button onClick={()=>{ 
                                        navigate("/deposits");
                                    }}>รายการฝากเงิน รออนุมัติ</button>
                                </div>
                                <div>
                                    <button onClick={()=>{ 
                                        navigate("/suppliers");
                                    }}>จัดการ Suppliers ทั้งหมด</button>
                                </div>

                                <div>
                                    <button onClick={()=>{ 
                                        navigate("/users");
                                    }}>จัดการ รายชือบุคคลทั้งหมด</button>
                                </div>
                                <div>
                                    <button onClick={()=>{ 
                                        navigate("/banks");
                                    }}>จัดการ รายชือธนาคารทั้งหมด</button>
                                </div>
                                <div>
                                    <button onClick={()=>{
                                        navigate("/date-lotterys");
                                    }}>จัดการ วันออกหวยทั้งหมด</button>
                                </div>

                                <div>
                                    <button onClick={()=>{ 
                                        navigate("/bank");
                                    }}>รายการ บัญชีธนาคาร ({user.banks.length})</button>
                                </div>
                            </div>
                            <AutoGenerationContent />
                        </div>
            }
            case AUTHENTICATED:{
                return  <div>
                            <div>
                                <button onClick={()=>{ 
                                    navigate("/book+buys");
                                }}>รายการ จอง-ซื้อ</button>
                            </div>
                            <div>
                                <button onClick={()=>{ 
                                    navigate("/deposit", {state: {from: "/", mode: "new"}} )
                                }}>รายการ แจ้งฝากเงิน</button>
                            </div>
                            <div>
                                <button onClick={()=>{ 
                                    navigate("/withdraw", {state: {from: "/", mode: "new"}} )
                                }}>รายการ แจ้งถอนเงิน</button>
                            </div>
                            <div>
                                <button onClick={()=>{ 
                                    navigate("/bank"); 
                                }}>รายการ บัญชีธนาคาร ({user.banks.length})</button>
                            </div>
                            <div>
                                <button onClick={()=>{
                                    navigate("/suppliers"); 
                                }}>Supplier list</button>
                            </div>

                            <div>
                                <button onClick={()=>{
                                    navigate("/history-transitions"); 
                                }}>History-Transitions</button>
                            </div>
                        </div>
            }
        }
    }

    const findNameBank = (id) =>{
        let bank = _.find(banks, (bank)=> _.isEqual(bank?._id, id) )
        return bank ? bank.name : ""
    }

    return (<div style={{flex:1}}>
                <>
                    <div>
                        <Avatar 
                            sx={{ width: 80, height: 80 }} 
                            src= { _.isEmpty(user?.avatar) ? "" :  user?.avatar?.url ? user?.avatar?.url : URL.createObjectURL(user?.avatar) }
                            variant="rounded" />
                        <>
                            <label htmlFor="contained-button-file">
                                <Input
                                    accept="image/*"
                                    id="contained-button-file"
                                    name="file"
                                    multiple={ false }
                                    type="file"
                                    onChange={(e) => {} /*setData({...data, avatar: e.target.files[0]})*/ } />
                                <IconButton
                                    color="primary"
                                    aria-label="upload picture"
                                    component="span">
                                    <CameraIcon size="0.8em"/>
                                </IconButton>
                            </label>
                            { user?.avatar?.url &&  <IconButton onClick={(evt)=> onLightbox({ isOpen: true, photoIndex: 0, images:[user?.avatar] }) }><ZoomInIcon size="0.8em" /></IconButton> }
                        </>
                    </div>
                    <div> Display name : {user.displayName} </div>
                    <div> Email : {user.email} </div>
                    <div>
                        <Accordion 
                            expanded={expanded}
                            onChange={(event, isExpanded)=>setExpanded(isExpanded)}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header">
                                <Typography>บัญชีธนาคาร ({user?.banks?.length})
                                    <IconButton onClick={(evt)=>navigate("/bank") }>
                                        <RiAddBoxFill />
                                    </IconButton>
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List>
                                    {
                                        _.map(user?.banks, (value, index)=>{
                                            console.log("bank: ", value)
                                            return  <ListItem
                                                        key={index}
                                                        secondaryAction={
                                                            <IconButton 
                                                                edge="end" 
                                                                aria-label="delete"
                                                                onClick={()=>onDialogDeleteBank(value?._id)}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        }>
                                                        <ListItemAvatar>
                                                            <Avatar><FolderIcon /></Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={value?.bankNumber}
                                                            secondary={ loadingBanks ? <LinearProgress/> : findNameBank(value?.bankId) }
                                                        />
                                                    </ListItem>
                                        })
                                    }
                                </List>
                            </AccordionDetails>
                        </Accordion>

                        {/* <Typography variant="h6" component="div">
                            บัญชีธนาคาร 
                            <IconButton
                                onClick={(evt)=>navigate("/bank") }>
                                <RiAddBoxFill />
                            </IconButton>
                        </Typography>
                        <List>
                            {
                                _.map(user?.banks, (value, index)=>{
                                    return  <ListItem
                                                key={index}
                                                secondaryAction={
                                                    <IconButton edge="end" aria-label="delete">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                }>
                                                <ListItemAvatar>
                                                    <Avatar><FolderIcon /></Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={value?.bankNumber}
                                                    secondary={ loadingBanks ? <LinearProgress/> : findNameBank(value?.bankId) }
                                                />
                                            </ListItem>
                                })
                            }
                        </List> */}
                    </div>

                    {/* <button onClick={()=>{
                        navigate("/user",  {
                                                search: `?${createSearchParams({ u: user?._id})}`,
                                                state: {from: "/", mode: "edit", id: user?._id }
                                            })
                    }}>แก้ไขข้อมูล</button>
                    <div> Balance : { user?.balance }[-{ user?.balanceBook }]</div> */}
                    {/* {managementView()} */}
                    {/* <button onClick={()=>{
                        logout()
                        // history.push("/");
                        navigate("/")
                    }}>Logout</button> */}
                </>
            </div>);
}

export default MePage