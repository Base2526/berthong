import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import {
  Stack,
  CircularProgress,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Dialog,
  Button
} from '@mui/material'
import _ from "lodash"
import { useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";

import { queryBookBuyTransitions } from "./gqlQuery"

const MeBookBuysPage = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  let { user } = props

  let [datas, setDatas] = useState([]);
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)

  let [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  const { loading: loadingBookBuyTransitions, 
          data: dataBookBuyTransitions, 
          error: errorBookBuyTransitions, 
          subscribeToMore, 
          networkStatus } = useQuery(queryBookBuyTransitions, { fetchPolicy: 'network-only', notifyOnNetworkStatusChange: true });

  useEffect(() => {
    if (!loadingBookBuyTransitions) {
      if(dataBookBuyTransitions?.bookBuyTransitions){
        let { status, data } = dataBookBuyTransitions?.bookBuyTransitions
        if(status){
          setDatas(data)
        }
      }
    }
  }, [dataBookBuyTransitions, loadingBookBuyTransitions])

  // const [onDeleteBank, resultDeleteBank] = useMutation(gqlDeleteBank, 
  //   {
  //     update: (cache, {data: {deleteBank}}) => {
  //       const data1 = cache.readQuery({
  //         query: gqlBanks,
  //       });

  //       let newBanks = {...data1.banks}
  //       let newData   = _.filter(data1.banks.data, bank => bank._id !== deleteBank._id)
  //       newBanks = {...newBanks, total: newData.length, data:newData }

  //       cache.writeQuery({
  //         query: gqlBanks,
  //         data: { banks: newBanks },
  //       });
  //     },
  //     onCompleted({ data }) {
  //       history.push("/banks");
  //     }
  //   }
  // );
  // console.log("resultDeleteBank :", resultDeleteBank)

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false });
  };

  const handleDelete = (id) => {
    // onDeleteBank({ variables: { id } });
  };

  const fetchMoreData = async() =>{
    // let mores =  await fetchMoreNotifications({ variables: { input: {...search, OFF_SET:search.OFF_SET + 1} } })
    // let {status, data} =  mores.data.suppliers
    // console.log("status, data :", status, data)
   
    if(slice === total){
        setHasMore(false);
    }else{
        setTimeout(() => {
            // let newDatas = [...datas, ...data]
            // setDatas(newDatas)
            // setSlice(newDatas.length);
        }, 1000); 
    }
  }

  return (
    <div className="user-list-container">
      {
        loadingBookBuyTransitions
        ?  <CircularProgress />
        :  datas.length == 0 
            ?   <label>Empty data</label>
            :   <InfiniteScroll
                    dataLength={slice}
                    next={fetchMoreData}
                    hasMore={hasMore}
                    loader={<h4>Loading...</h4>}>
                    { 
                     _.map(datas, (i, index) => {
                      return  <Stack direction="row" spacing={2}>{index}</Stack>
                     })

                     /*
                     /// 1
                     let {buys} = props.row.original

let book  = _.filter(buys, buy=> _.isEqual(buy.userId, user._id)  && buy.selected == 0)
let buy  = _.filter(buys, buy=> _.isEqual(buy.userId, user._id)  && buy.selected == 1)
return (
  <div>Book : {book.length}, Buy : {buy.length}</div>
);


/// 2
let {_id, title} = props.row.original
            return (<div onClick={(e)=>{ 
              // history.push({ pathname: "/p", search: `?id=${_id}`, state: { id: _id } }) 
              navigate({
                        pathname: "/d",
                        search: `?${createSearchParams({ id: _id})}`,
                        state: { id: _id }
                      })
            }}>{title}</div>)
                     */
                    }
                </InfiniteScroll>
      }

      {openDialogDelete.isOpen && (
        <Dialog
          open={openDialogDelete.isOpen}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{t("confirm_delete")}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{openDialogDelete.description}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => {
                handleDelete(openDialogDelete.id);

                setOpenDialogDelete({ isOpen: false, id: "", description: "" });
              }}
            >{t("delete")}</Button>
            <Button variant="contained" onClick={handleClose} autoFocus>{t("close")}</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

const mapStateToProps = (state, ownProps) => {
  return { }
};

const mapDispatchToProps = { }
export default connect( mapStateToProps, mapDispatchToProps )(MeBookBuysPage);