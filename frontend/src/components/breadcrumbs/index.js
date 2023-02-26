import MuiLink from "@material-ui/core/Link";
import HomeIcon from '@mui/icons-material/Home';
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link, useLocation } from "react-router-dom";

import Typography from '@mui/material/Typography';

import { useTranslation } from "react-i18next";

const index = ({ title }) => {
  const location = useLocation();
  const { t } = useTranslation();

  const BreadcrumbsView = () =>{
    console.log("location :", location)

    switch(location?.pathname){
      case "/":{
        return [  
                  // <MuiLink component={Link} to="/">
                  //   <HomeIcon /> {t("home")} 
                  // </MuiLink>
                  <Typography key="3" color="text.primary">
                   <HomeIcon /> {t("home")} 
                  </Typography>
                ]
      }
      case "/p":{
        return [  
                  <MuiLink component={Link} to="/">
                    <HomeIcon /> {t("home")} 
                  </MuiLink>,
                  <Typography key="3" color="text.primary">
                    Detail
                  </Typography>
                ]
      }

      case "/withdraws":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">รายการฝากเงิน รออนุมัติ</Typography>
        ]
      }

      case "/deposits":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">รายการถอดเงิน รออนุมัติ</Typography>
        ]
      }

      case "/suppliers":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">Suppliers ทั้งหมด</Typography>
        ]
      }

      case "/users":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">รายชื่อบุคคลทั้งหมด</Typography>
        ]
      }

      case "/banks":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon /> {t("home")}</MuiLink>,
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
          <MuiLink component={Link} to="/"><HomeIcon /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">History transitions</Typography>
        ]
      }

      case "/book+buys":{
        return [  
          <MuiLink component={Link} to="/"><HomeIcon /> {t("home")}</MuiLink>,
          <Typography key="3" color="text.primary">รายการ จอง-ซื้อ</Typography>
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

export default index;
