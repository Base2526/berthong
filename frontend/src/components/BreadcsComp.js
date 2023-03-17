import MuiLink from "@material-ui/core/Link";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Breadcrumbs, Typography, LinearProgress } from "@mui/material";
import queryString from 'query-string';
import { useQuery } from "@apollo/client";
import _ from "lodash"

import { AiFillHome as HomeIcon} from 'react-icons/ai';
import {
  MdCircleNotifications as MdCircleNotificationsIcon,
} from 'react-icons/md';

import {
  BiWalletAlt as AccountBalanceWalletIcon,
} from 'react-icons/bi';

import { AMDINISTRATOR, AUTHENTICATED } from "../constants";
import { getHeaders, checkRole } from "../util"
import { queryProfile } from "../gqlQuery"
import { useEffect, useState } from "react";

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
          refetch: refetchProfile } = useQuery( queryProfile, { 
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
      if(dataProfile?.profile){
        let { status, data } = dataProfile?.profile
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
                  <Typography key="1" color="text.primary">Detail</Typography>
                ]
      }

      case "/withdraws":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon  size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">รายการ ถอดเงินรออนุมัติ</Typography>
        ]
      }

      case "/deposits":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">รายการ ฝากเงินรออนุมัติ</Typography>
        ]
      }

      case "/suppliers":{
        switch(checkRole(user)){
          case AMDINISTRATOR:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <Typography key="1" color="text.primary">รายการ สินค้าทั้งหมด</Typography>
            ]
          }
          case AUTHENTICATED:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <Typography key="1" color="text.primary">รายการ สินค้า</Typography>
            ]
          }
        }
        
      }

      case "/users":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">รายชื่อบุคคลทั้งหมด</Typography>
        ]
      }

      case "/user":{
        switch(checkRole(user)){
          case AMDINISTRATOR:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <MuiLink key="1" component={Link} to="/users">{t("รายชื่อบุคคลทั้งหมด")}</MuiLink>,
              <Typography key="2" color="text.primary">Profile</Typography>
            ]
          }
          case AUTHENTICATED:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <Typography key="1" color="text.primary">Profile</Typography>
            ]
          }
        }
      }

      case "/banks":{
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
              <MuiLink key="1" component={Link} to="/suppliers">{t("รายการ สินค้าทั้งหมด")}</MuiLink>,
              <Typography key="2" color="text.primary">สร้าง supplier ใหม่</Typography>
            ]
          }

          case "edit":{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon /> {t("home")}</MuiLink>,
              <MuiLink key="1" component={Link} to="/suppliers"> {t("รายการ สินค้าทั้งหมด")}</MuiLink>,
              <Typography key="2" color="text.primary">แก้ไข supplier</Typography>
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

      case "/me+book+buys":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">รายการ จอง-ซื้อ</Typography>
        ]
      }

      case "/p":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">{loadingProfile ? <LinearProgress/> : profile?.displayName}</Typography>
        ]
      }

      case "/deposit":{
        switch(checkRole(user)){
          case AMDINISTRATOR:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <MuiLink key="1" component={Link} to="/deposits">{t("รายการ แจ้งฝากเงิน")}</MuiLink>,
              <Typography key="2" color="text.primary">แจ้งฝากเงิน</Typography>
            ]
          }
          case AUTHENTICATED:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <Typography key="1" color="text.primary">แจ้งฝากเงิน</Typography>
            ]
          }
        }
      }

      case "/withdraw":{
        switch(checkRole(user)){
          case AMDINISTRATOR:{
            return [  
              <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <MuiLink key="1" component={Link} to="/withdraws">{t("รายการ แจ้งถอดเงิน")}</MuiLink>,
              <Typography key="2" color="text.primary">แจ้งถอดเงิน</Typography>
            ]
          }
          case AUTHENTICATED:{
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
          <Typography key="1" color="text.primary"><MdCircleNotificationsIcon  size={"1.5em"} /> {t("Notifications")} </Typography>
        ]
      }

      case "/me+banks":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="1" color="text.primary">รายการ บัญชีธนาคาร</Typography>
        ]
      }

      case "/me+bank":{
        return [  
          <MuiLink key="0" component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <MuiLink key="0" component={Link} to="/me+banks"><AccountBalanceWalletIcon size="1.5em" />รายการ บัญชีธนาคาร</MuiLink>,
          <Typography key="1" color="text.primary">บัญชีธนาคาร</Typography>
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
