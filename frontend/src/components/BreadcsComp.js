import React, { useEffect, useState } from "react";
import MuiLink from "@material-ui/core/Link";
import { Link, useLocation, useParams } from "react-router-dom";
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
import { queryFriendProfile } from "../gqlQuery"
import * as Constants from "../constants"

const BreadcsComp = (props) => {
  const location = useLocation();
  const { t } = useTranslation();
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

      case "/suppliers":{
        switch(checkRole(user)){
          case Constants.AMDINISTRATOR:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <Typography key="1" color="text.primary">รายการสินค้าทั้งหมด</Typography>
            ]
          }
          case Constants.AUTHENTICATED:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <Typography key="1" color="text.primary">รายการสินค้า</Typography>
            ]
          }
        }
        
      }

      case "/users":{
        // let [total, setTotal] = useState(0)
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
              <MuiLink key="1" component={Link} to="/users">{t("รายชื่อบุคคลทั้งหมด")}</MuiLink>,
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

      case "/supplier":{
        let { state } = location
        switch(state?.mode){
          case "new":{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon /> {t("home")}</MuiLink>,
              <MuiLink key="1" component={Link} to="/suppliers">{t("รายการสินค้าทั้งหมด")}</MuiLink>,
              <Typography key="2" color="text.primary">เพิ่มสินค้าใหม่</Typography>
            ]
          }

          case "edit":{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon /> {t("home")}</MuiLink>,
              <MuiLink key="1" component={Link} to="/suppliers"> {t("รายการสินค้าทั้งหมด")}</MuiLink>,
              <Typography key="2" color="text.primary">แก้ไขสินค้า</Typography>
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
        switch(checkRole(user)){
          case Constants.AMDINISTRATOR:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18}/>{t("home")}</MuiLink>,
              <MuiLink key="1" component={Link} to="/users">รายชื่อบุคคลทั้งหมด</MuiLink>,
              <Typography key="2" color="text.primary">โปรไฟล์ {loadingProfile ? <LinearProgress/> : profile?.displayName}</Typography>
            ]
          }
          case Constants.AUTHENTICATED:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <Typography key="1" color="text.primary">โปรไฟล์ {loadingProfile ? <LinearProgress/> : profile?.displayName}</Typography>
            ]
          }
        }
      }

      case "/deposit":{
        switch(checkRole(user)){
          case Constants.AMDINISTRATOR:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <MuiLink key="1" component={Link} to="/deposits">{t("รายการ แจ้งฝากเงิน")}</MuiLink>,
              <Typography key="2" color="text.primary">แจ้งฝากเงิน</Typography>
            ]
          }
          case Constants.AUTHENTICATED:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <Typography key="1" color="text.primary">แจ้งฝากเงิน</Typography>
            ]
          }
        }
      }

      case "/withdraw":{
        switch(checkRole(user)){
          case Constants.AMDINISTRATOR:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <MuiLink key="1" component={Link} to="/withdraws">{t("รายการ แจ้งถอดเงิน")}</MuiLink>,
              <Typography key="2" color="text.primary">แจ้งถอดเงิน</Typography>
            ]
          }
          case Constants.AUTHENTICATED:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <Typography key="1" color="text.primary">แจ้งถอดเงิน</Typography>
            ]
          }
        }
      }

      case "/date-lotterys":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">วันออกหวยทั้งหมด</Typography>
        ]
      }

      case "/notifications":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">{t("Notifications")}</Typography>
        ]
      }

      case "/banks":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">รายการ บัญชีธนาคาร</Typography>
        ]
      }

      case "/bank":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <MuiLink key="0" component={Link} to="/banks">รายการ บัญชีธนาคาร</MuiLink>,
          <Typography key="1" color="text.primary">บัญชีธนาคาร</Typography>
        ]
      }

      case "/me":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">Profile</Typography>
        ]
      }
   
      default: 
        return []
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
