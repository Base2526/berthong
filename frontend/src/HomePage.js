import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import CircularProgress from '@mui/material/CircularProgress';
import { useQuery, useMutation } from "@apollo/client";
import _ from "lodash"
import CardActionArea from "@material-ui/core/CardActionArea";
import Avatar from "@mui/material/Avatar";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

import { queryHomes, subscriptionSuppliers, mutationMe } from "./gqlQuery"
import { getHeaders, checkRole } from "./util"
import { AMDINISTRATOR, AUTHENTICATED } from "./constants"
import { login, logout } from "./redux/actions/auth"
import DialogLogin from "./DialogLogin"

let unsubscribeSuppliers = null;
const HomePage = (props) => {
  let history = useHistory();
  let { t } = useTranslation();
  let [dialogLoginOpen, setDialogLoginOpen] = useState(false);
  let [lightbox, setLightbox]       = useState({ isOpen: false, photoIndex: 0, images: [] });

  let { user } = props

  useEffect(()=>{
    return () => {
      unsubscribeSuppliers && unsubscribeSuppliers()
    };
  }, [])

  const [onMe, resultMeValues] = useMutation(mutationMe,{
    context: { headers: getHeaders() },
    update: (cache, {data: {me}}) => {
      console.log("onMe :", me)
    },
    onCompleted({ data }) {
      console.log("onCompleted")
    },
    onError: (err) => {
      console.log("onError :", err)
    }
  });
  
  const suppliersValues =useQuery(queryHomes, { context: { headers: getHeaders() }, notifyOnNetworkStatusChange: true});

  console.log("suppliersValues: ", suppliersValues)
  if(suppliersValues.loading){
    return <div><CircularProgress /></div>
  }else{
    if(_.isEmpty(suppliersValues.data.homes)){
      return;
    }

    // let {subscribeToMore, networkStatus} = suppliersValues
    // let keys = _.map(suppliersValues.data.suppliers.data, _.property("_id"));
    
    // unsubscribeSuppliers && unsubscribeSuppliers()
    // unsubscribeSuppliers =  subscribeToMore({
		// 	document: subscriptionSuppliers,
    //   variables: { supplierIds: JSON.stringify(keys) },
		// 	updateQuery: (prev, {subscriptionData}) => {        
    //     if (!subscriptionData.data) return prev;

    //     let { mutation, data } = subscriptionData.data.subscriptionSuppliers;
    //     switch(mutation){
    //       case "BOOK":
    //       case "UNBOOK":{
    //         let newData = _.map((prev.suppliers.data), (item)=> item._id == data._id ? data : item )

    //         let newPrev = {...prev.suppliers, data: newData}
    //         return {suppliers: newPrev}; 
    //       }
    //       default:
    //         return prev;
    //     }
		// 	}
		// });
  }

  // console.log("checkRole :", checkRole(user), user)

  const managementView = () =>{
    switch(checkRole(user)){
      case AMDINISTRATOR:{
        return  <div>
                  <div onClick={()=>{ history.push("/me") }}>AMDINISTRATOR : {user.displayName} - {user.email}</div>
                </div>
      }

      case AUTHENTICATED:{
        return  <div>
                
                  <div onClick={()=>{ history.push("/me") }}>AUTHENTICATED : {user.displayName} - {user.email}</div>
                </div>
      }
      
      default:{
        return  <div>
                  <div>ANONYMOUS</div>
                  <div>
                    <button onClick={()=>setDialogLoginOpen(true)}>Login</button>
                  </div>
                </div>
      }
    }
  }

  const bookView = (val) =>{
    let fn = _.filter(val.buys, (buy)=> buy.selected == 0 );
    // console.log("val :", val, fn)

    return fn.length;
  }

  const sellView = (val) =>{
    let fn = _.filter(val.buys, (buy)=> buy.selected == 1 );
    // console.log("val :", val, fn)

    return fn.length;
  }

  const imageView = (val) =>{
    return (
      <div style={{ position: "relative" }}>
        <CardActionArea style={{ position: "relative", paddingBottom: "10px" }}>
          <Avatar
            sx={{ height: 100, width: 100 }}
            variant="rounded"
            alt="Example Alt"
            src={val.files[0].url}
            onClick={(e) => {
              setLightbox({ isOpen: true, photoIndex: 0, images:val.files })
            }}
          />
        </CardActionArea>
        <div style={{ position: "absolute", bottom: "5px", right: "5px", padding: "5px", backgroundColor: "#e1dede", color: "#919191"}}>
          {(_.filter(val.files, (v)=>v.url)).length}
        </div>
      </div>
    );
  }

  return (<div style={{flex:1}}>
            {managementView()}
            {
              _.map(suppliersValues.data.homes.data, (val, k)=>{
                return  <div key={k} className="home-item" >
                          <div onClick={()=>{
                            history.push({pathname: "/profile", search: `?u=${val.ownerId}` })
                          }}>Supplier : {val.ownerName}</div>
                          {imageView(val)}
                          <div>{val.title}</div>
                          <div>จอง :{bookView(val)}</div>
                          <div>ขายไปแล้ว :{sellView(val)}</div>
                          <button onClick={(evt)=>{
                            history.push({
                              pathname: "/detail",
                              // search: "?id=5",
                              // hash: "#react",
                              state: { id: val._id }
                            });
                          }}>ดูรายละเอียด</button>
                        </div>
              })
            }

            {dialogLoginOpen && (
              <DialogLogin
                {...props}
                open={dialogLoginOpen}
                onComplete={async(data)=>{
                  setDialogLoginOpen(false);
                }}
                onClose={() => {
                  setDialogLoginOpen(false);
                }}
              />
            )}

            {lightbox.isOpen && (
              <Lightbox
                mainSrc={lightbox.images[lightbox.photoIndex].url}
                nextSrc={lightbox.images[(lightbox.photoIndex + 1) % lightbox.images.length].url}
                prevSrc={
                  lightbox.images[(lightbox.photoIndex + lightbox.images.length - 1) % lightbox.images.length].url
                }
                onCloseRequest={() => {
                  setLightbox({ ...lightbox, isOpen: false });
                }}
                onMovePrevRequest={() => {
                  setLightbox({
                    ...lightbox,
                    photoIndex:
                      (lightbox.photoIndex + lightbox.images.length - 1) % lightbox.images.length
                  });
                }}
                onMoveNextRequest={() => {
                  setLightbox({
                    ...lightbox,
                    photoIndex: (lightbox.photoIndex + 1) % lightbox.images.length
                  });
                }}
              />
            )}
          </div>);
}

const mapStateToProps = (state, ownProps) => {
  return { user:state.auth.user }
};

const mapDispatchToProps = { login, logout }
export default connect( mapStateToProps, mapDispatchToProps )(HomePage);