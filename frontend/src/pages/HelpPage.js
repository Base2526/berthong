import React, { useEffect, useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Avatar,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    LinearProgress,
    Button
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

import { queryBankByIds } from "../apollo/gqlQuery"
import { getHeaders, handlerErrorApollo } from "../util";

const Input = styled("input")({ display: "none" });

let initValues = {
    displayName: ""
}

const HelpPage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    return (<div>HELP PAGE</div>);
}
export default HelpPage