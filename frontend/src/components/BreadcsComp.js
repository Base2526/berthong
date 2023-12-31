import React, { useEffect, useState } from "react";
import MuiLink from "@material-ui/core/Link";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Breadcrumbs, Typography, LinearProgress } from "@mui/material";
import queryString from 'query-string';
import { useQuery } from "@apollo/client";
import _ from "lodash"
import { 
  AiFillHome as HomeIcon
} from 'react-icons/ai';
import {
  MdCircleNotifications as MdCircleNotificationsIcon,
} from 'react-icons/md';

import { getHeaders, checkRole } from "../util"
import { queryFriendProfile } from "../apollo/gqlQuery"
import * as Constants from "../constants"

const BreadcsComp = (props) => {
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const { user } = props

  let [profile, setProfile] = useState()

  let queryParams = queryString.parse(location.search)
  
  const { loading: loadingProfile, 
          data: dataProfile, 
          error: errorProfile, 
          networkStatus,
          refetch: refetchProfile } = useQuery( queryFriendProfile, { 
                                      context: { headers: getHeaders(location) }, 
                                      fetchPolicy: 'cache-only', 
                                      nextFetchPolicy: 'network-only', 
                                      notifyOnNetworkStatusChange: true});

  useEffect(()=>{
    if(location?.pathname === "/p" && !_.isEmpty(queryParams?.id)){
      refetchProfile({id: queryParams?.id});
    }
  }, [queryParams?.id])

  useEffect(() => {
    if (!loadingProfile) {
      if(dataProfile?.friendProfile){
        let { status, data } = dataProfile?.friendProfile
        if(status){
          setProfile(data)
        }
      }
    }
  }, [dataProfile, loadingProfile])

  const BreadcrumbsView = () =>{
    switch(location?.pathname){
      case "/":{
        return [<Typography key="0" color="text.primary"><HomeIcon size={18}/>{t("home")}</Typography>]
      }

      case "/register":{
        return [  
            <MuiLink key="0" component={Link} to="/"><HomeIcon  size={18}/> {t("home")}</MuiLink>,
            <Typography key="1" color="text.primary">สมัครสมาชิก</Typography>
          ]
      }

      case "/d":{
        return [  
            <MuiLink key="0" component={Link} to="/"><HomeIcon  size={18}/> {t("home")}</MuiLink>,
            <Typography key="1" color="text.primary">รายละเอียดสินค้า</Typography>
          ]
      }

      case "/withdraws":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon  size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">รายการถอดเงินรออนุมัติ</Typography>
        ]
      }

      case "/deposits":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">รายการฝากเงินรออนุมัติ</Typography>
        ]
      }

      case "/lotterys":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">รายการหวยทั้งหมด</Typography>
        ]
      }

      case "/users":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">รายชื่อบุคคลทั้งหมด</Typography>
        ]
      }

      case "/user":{
        switch(checkRole(user)){
          case Constants.AMDINISTRATOR:{
            const { mode, id } = location.state
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              // <MuiLink key="1" component={Link} to="/users">{t("รายชื่อบุคคลทั้งหมด")}</MuiLink>,
              <Typography key="2" color="text.primary">{ _.isEqual(mode, "edit") ? "แก้ไข" : "" } โปรไฟล์</Typography>
            ]
          }
          case Constants.AUTHENTICATED:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <Typography key="1" color="text.primary">Profile</Typography>
            ]
          }
        }
      }

      case "/taxonomy-banks":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">รายชื่อธนาคารทั้งหมด</Typography>
        ]
      }

      case "/lottery":{
        let { state } = location
        switch(state?.mode){
          case "new":{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon /> {t("home")}</MuiLink>,
              <Typography key="2" color="text.primary">เพิ่มหวยใหม่</Typography>
            ]
          }

          case "edit":{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon /> {t("home")}</MuiLink>,
              <Typography key="2" color="text.primary">แก้ไขหวย</Typography>
            ]
          }
        }
      }

      case "/history-transitions":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">ประวัติการ ฝาก-ถอน</Typography>
        ]
      }

      case "/book-buy":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">รายการ จอง-ซื้อ</Typography>
        ]
      }

      case "/p":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18}/>{t("home")}</MuiLink>,
          <Typography key="2" color="text.primary">โปรไฟล์ {loadingProfile ? <LinearProgress/> : profile?.displayName}</Typography>
        ]
      }
      case "/all-deposits":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="2" color="text.primary">แจ้งฝากเงินทั้งหมด</Typography>
        ]
      }

      case "/deposit":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">แจ้งฝากเงิน</Typography>
        ]
      }

      case "/all-withdraws":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="2" color="text.primary">แจ้งถอดเงินทั้งหมด</Typography>
        ]
      }

      case "/withdraw":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">แจ้งถอดเงิน</Typography>
        ]
      }

      case "/manage-lottery":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">จัดการหวย</Typography>
        ]
      }

      case "/manage-lotterys":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">จัดการหวยทั้งหมด</Typography>
        ]
      }

      case "/notifications":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">{t("notifications")}</Typography>
        ]
      }

      case "/bookmarks":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">{t("bookmark")}</Typography>
        ]
      }

      case "/subscribes":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">{t("subscribes")}</Typography>
        ]
      }

      case "/banks":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">รายการ บัญชีธนาคาร</Typography>
        ]
      }

      case "/contact-us":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">ติดต่อเรา</Typography>
        ]
      }

      case "/bank":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">เพิ่ม บัญชีธนาคาร</Typography>
        ]
      }

      case "/me":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">{t("profile")}</Typography>
        ]
      }

      case "/messages":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">{t("all_message")}</Typography>
        ]
      }

      case "/dblog":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">{t("DB Log")}</Typography>
        ]
      }

      case "/development":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">{t("Development")}</Typography>
        ]
      }

      case "/contents":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">{t("Contents")}</Typography>
        ]
      }

      case "/content":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">{t("content")}</Typography>
        ]
      }

      case "/help":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">{t("help")}</Typography>
        ]
      }

      case "/all-sell":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">รายการขายทั้งหมด</Typography>
        ]
      }

      case "/pay":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">จ่าย</Typography>
        ]
      }
   
      default: 
        return [ <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink> ]
    }
  }

  return (
    <div role="presentation" className="container-breadcrumb">
      <div className="row">
        <Breadcrumbs aria-label="breadcrumb" separator="›" >
          {BreadcrumbsView()}
        </Breadcrumbs>
      </div>
    </div>
  );
};

export default BreadcsComp;
