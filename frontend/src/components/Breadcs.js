import MuiLink from "@material-ui/core/Link";
// import HomeIcon from '@mui/icons-material/Home';
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Breadcrumbs, Typography, LinearProgress } from "@mui/material";
import queryString from 'query-string';
import { useQuery } from "@apollo/client";
import _ from "lodash"

import { AiFillHome as HomeIcon} from 'react-icons/ai';

import { AMDINISTRATOR, AUTHENTICATED } from "../constants";
import { getHeaders, checkRole } from "../util"
import { queryProfile } from "../gqlQuery"
import { useEffect, useState } from "react";

const Breadcs = (props) => {
  const location = useLocation();
  const { t } = useTranslation();
  const params = useParams();
  const { user } = props

  let [profile, setProfile] = useState()

  let queryParams = queryString.parse(location.search)
  
  // console.log("params :", queryParams)
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
    // console.log("location :", location, params, props)

    switch(location?.pathname){
      case "/":{
        return [  
                  <Typography key="3" color="text.primary">
                   <HomeIcon  size={18} /> {t("home")} 
                  </Typography>
                ]
      }
      case "/d":{
        return [  
                  <MuiLink component={Link} to="/">
                    <HomeIcon  size={18}/> {t("home")} 
                  </MuiLink>,
                  <Typography key="3" color="text.primary">
                    Detail
                  </Typography>
                ]
      }

      case "/withdraws":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon  size={18} /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">รายการ ถอดเงิน รออนุมัติ</Typography>
        ]
      }

      case "/deposits":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">รายการถอดเงิน รออนุมัติ</Typography>
        ]
      }

      case "/suppliers":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">Suppliers ทั้งหมด</Typography>
        ]
      }

      case "/users":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">รายชื่อบุคคลทั้งหมด</Typography>
        ]
      }

      case "/user":{
        switch(checkRole(user)){
          case AMDINISTRATOR:{
            return [  
              <MuiLink component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <MuiLink component={Link} to="/users">{t("รายชื่อบุคคลทั้งหมด")}</MuiLink>,
              <Typography key="3" color="text.primary">Profile</Typography>
            ]
          }
          case AUTHENTICATED:{
            return [  
              <MuiLink component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <Typography key="3" color="text.primary">Profile</Typography>
            ]
          }
        }
      }

      case "/banks":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">รายชื่อธนาคารทั้งหมด</Typography>
        ]
      }

      case "/supplier":{
        let { state } = location
        switch(state?.mode){
          case "new":{
            return [  
              <MuiLink component={Link} to="/"><HomeIcon /> {t("home")}</MuiLink>,
              <MuiLink component={Link} to="/suppliers">{t("Suppliers ทั้งหมด")}</MuiLink>,
              <Typography key="3" color="text.primary">สร้าง supplier ใหม่</Typography>
            ]
            // 
          }

          case "edit":{
            return [  
              <MuiLink component={Link} to="/"><HomeIcon /> {t("home")}</MuiLink>,
              <MuiLink component={Link} to="/suppliers"> {t("Suppliers ทั้งหมด")}</MuiLink>,
              <Typography key="3" color="text.primary">แก้ไข supplier</Typography>
            ]
          }
        }
      }

      case "/history-transitions":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">History transitions</Typography>
        ]
      }

      case "/book+buys":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">รายการ จอง-ซื้อ</Typography>
        ]
      }

      case "/p":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">{loadingProfile ? <LinearProgress/> : profile?.displayName}</Typography>
        ]
      }

      case "/deposit":{
        switch(checkRole(user)){
          case AMDINISTRATOR:{
            return [  
              <MuiLink component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <MuiLink component={Link} to="/deposits">{t("รายการ แจ้งฝากเงิน")}</MuiLink>,
              <Typography key="3" color="text.primary">แจ้งฝากเงิน</Typography>
            ]
          }
          case AUTHENTICATED:{
            return [  
              <MuiLink component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <Typography key="3" color="text.primary">แจ้งฝากเงิน</Typography>
            ]
          }
        }
      }

      case "/withdraw":{
        switch(checkRole(user)){
          case AMDINISTRATOR:{
            return [  
              <MuiLink component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <MuiLink component={Link} to="/withdraws">{t("รายการ แจ้งถอดเงิน")}</MuiLink>,
              <Typography key="3" color="text.primary">แจ้งถอดเงิน</Typography>
            ]
          }
          case AUTHENTICATED:{
            return [  
              <MuiLink component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
              <Typography key="3" color="text.primary">แจ้งถอดเงิน</Typography>
            ]
          }
        }
      }

      case "/date-lotterys":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon size={18} /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">วันออกหวยทั้งหมด</Typography>
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

export default Breadcs;
