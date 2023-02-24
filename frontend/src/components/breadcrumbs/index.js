import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link, useMatch, useLocation } from "react-router-dom";
import MuiLink from "@material-ui/core/Link";
import HomeIcon from '@mui/icons-material/Home';

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
                  <MuiLink component={Link} to="/">
                    <HomeIcon /> {t("home")} 
                  </MuiLink>
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
