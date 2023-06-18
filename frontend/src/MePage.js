import React, { useState, useMemo } from "react";
import queryString from 'query-string';
import { useTranslation } from "react-i18next";
import { createSearchParams, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
    Avatar,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    AiFillCamera as CameraIcon,
    AiOutlineZoomIn as ZoomInIcon
} from "react-icons/ai" 
import {
    RiAddBoxFill
} from "react-icons/ri"
import {
    FcExpand as ExpandMoreIcon
} from "react-icons/fc"
import {
    RiDeleteBin5Fill as  DeleteIcon
} from "react-icons/ri"
import {
    AiFillFolder as FolderIcon
} from "react-icons/ai"
import { IconButton } from "@material-ui/core";
import _ from "lodash"
import { styled } from "@mui/material/styles";

const Input = styled("input")({ display: "none" });
const MePage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const params = queryString.parse(location.search)
    const { user, onMutationMe, onDialogDeleteBank, onLightbox } = props
    // const [banks, setBanks] = useState([])
    const [expanded, setExpanded] = useState(localStorage.getItem('expanded') ? localStorage.getItem('expanded') : false)


    console.log("user : ", user)

    // const managementView = () =>{
    //     switch(checkRole(user)){
    //         case AMDINISTRATOR:{
    //             return  <div>
    //                         <div className="div-management">
    //                             <div>Management</div>
    //                             <div>
    //                                 <button onClick={()=>{ 
    //                                     navigate("/withdraws");
    //                                 }}>รายการถอดเงิน รออนุมัติ</button>
    //                             </div>
    //                             <div>
    //                                 <button onClick={()=>{ 
    //                                     navigate("/deposits");
    //                                 }}>รายการฝากเงิน รออนุมัติ</button>
    //                             </div>
    //                             <div>
    //                                 <button onClick={()=>{ 
    //                                     navigate("/suppliers");
    //                                 }}>จัดการ Suppliers ทั้งหมด</button>
    //                             </div>

    //                             <div>
    //                                 <button onClick={()=>{ 
    //                                     navigate("/users");
    //                                 }}>จัดการ รายชือบุคคลทั้งหมด</button>
    //                             </div>
    //                             <div>
    //                                 <button onClick={()=>{ 
    //                                     navigate("/banks");
    //                                 }}>จัดการ รายชือธนาคารทั้งหมด</button>
    //                             </div>
    //                             <div>
    //                                 <button onClick={()=>{
    //                                     navigate("/date-lotterys");
    //                                 }}>จัดการ วันออกหวยทั้งหมด</button>
    //                             </div>

    //                             <div>
    //                                 <button onClick={()=>{ 
    //                                     navigate("/bank");
    //                                 }}>รายการ บัญชีธนาคาร ({user.banks.length})</button>
    //                             </div>
    //                         </div>
    //                         <AutoGenerationContent />
    //                     </div>
    //         }
    //         case AUTHENTICATED:{
    //             return  <div>
    //                         <div>
    //                             <button onClick={()=>{ 
    //                                 navigate("/book+buys");
    //                             }}>รายการ จอง-ซื้อ</button>
    //                         </div>
    //                         <div>
    //                             <button onClick={()=>{ 
    //                                 navigate("/deposit", {state: {from: "/", mode: "new"}} )
    //                             }}>รายการ แจ้งฝากเงิน</button>
    //                         </div>
    //                         <div>
    //                             <button onClick={()=>{ 
    //                                 navigate("/withdraw", {state: {from: "/", mode: "new"}} )
    //                             }}>รายการ แจ้งถอนเงิน</button>
    //                         </div>
    //                         <div>
    //                             <button onClick={()=>{ 
    //                                 navigate("/bank"); 
    //                             }}>รายการ บัญชีธนาคาร ({user.banks.length})</button>
    //                         </div>
    //                         <div>
    //                             <button onClick={()=>{
    //                                 navigate("/suppliers"); 
    //                             }}>Supplier list</button>
    //                         </div>

    //                         <div>
    //                             <button onClick={()=>{
    //                                 navigate("/history-transitions"); 
    //                             }}>History-Transitions</button>
    //                         </div>
    //                     </div>
    //         }
    //     }
    // }

    return  useMemo(() => {
            return (<div className="content-bottom">
                        <div className="content-page border">
                            <div className="row pt-3">
                            <div className="col-lg-6 col-12">
                                <div className="row p-2">
                                    <div className="col-lg-12 col-12 text-center">
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
                                                onChange={(e)=>{
                                                    onMutationMe({ variables: { input: {  type:'avatar', data: e.target.files[0] } } })
                                                }} />
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
                                    <div className="col-lg-12 col-12">
                                        <div className="text-center"><span className="header-c">Display name</span> : {user?.displayName} </div>
                                        <div className="text-center"><span className="header-c text-center"> Email :</span> {user?.email} </div>
                                        <div className="text-center"><span className="header-c text-center"> Balance :</span> {user?.balance} [จอง -{user?.balanceBook}] </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-12">
                                <div className="row">
                                    <div className="col-lg-12 col-12">
                                    <Accordion 
                                        expanded={expanded}
                                        onChange={(event, isExpanded)=>{
                                            setExpanded(isExpanded)
                                            localStorage.setItem('expanded', isExpanded)
                                        }}>
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
                                                        return  <ListItem
                                                                    key={index}
                                                                    secondaryAction={
                                                                        <IconButton edge="end" aria-label="delete"
                                                                            onClick={()=>onDialogDeleteBank(value?._id)}>
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    }>
                                                                    <ListItemAvatar>
                                                                        <Avatar><FolderIcon /></Avatar>
                                                                    </ListItemAvatar>
                                                                    <ListItemText
                                                                        primary={value?.bankNumber}
                                                                        secondary={ value?.name }
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
                        </div>
                        </div>
                    </div>)
            }, [ user, expanded ]);
}
export default MePage