import { useState, useContext, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { connect } from "react-redux";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from '@mui/material/CircularProgress';
import _ from "lodash"
import { useQuery, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";

import { queryBookBuyTransitions } from "./gqlQuery"
import TableComp from "./components/TableComp"

const BookBuysPage = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  let { user } = props

  let [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  let [pageIndex, setPageIndex] = useState(0);  
  let [pageSize, setPageSize] = useState(pageOptions[0])

  let [datas, setDatas] = useState([]);

  let [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  const { loading:loadingBookBuyTransitions, 
          data: dataBookBuyTransitions, 
          error: errorBookBuyTransitions, 
          subscribeToMore, 
          networkStatus } = useQuery(queryBookBuyTransitions, { fetchPolicy: 'network-only', notifyOnNetworkStatusChange: true });

  // console.log("bookBuyTransitionsValues :", bookBuyTransitionsValues)

  useEffect(() => {
    if (dataBookBuyTransitions) {
      let { status, data } = dataBookBuyTransitions.bookBuyTransitions
      if(status){
        setDatas(data)
      }
    }
  }, [dataBookBuyTransitions])

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

  ///////////////
  const fetchData = useCallback(({ pageSize, pageIndex }) => {
    setPageSize(pageSize)
    setPageIndex(pageIndex)
  })
  ///////////////

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false });
  };

  const handleDelete = (id) => {
    // onDeleteBank({ variables: { id } });
  };

  ///////////////////////
  const columns = useMemo(
    () => [
        {
          Header: 'Title',
          accessor: 'title',
          Cell: props =>{
            let {_id, title} = props.row.original
            return (<div onClick={(e)=>{ 
              // history.push({ pathname: "/p", search: `?id=${_id}`, state: { id: _id } }) 
              navigate({
                        pathname: "/d",
                        search: `?${createSearchParams({ id: _id})}`,
                        state: { id: _id }
                      })
            }}>{title}</div>)
          }
        },
        // {
        //   Header: 'Description',
        //   accessor: 'description',
        //   Cell: props => {
        //     return (
        //       <div>
        //         <Typography
        //           variant="body1"
        //           gutterBottom
        //           dangerouslySetInnerHTML={{
        //             __html: props.row.original.description
        //           }}
        //         />
        //       </div>
        //     );
        //   }
        // },
        {
          Header: 'Book - Buy',
          accessor: 'buys',
          Cell: props => {
            let {buys} = props.row.original

            let book  = _.filter(buys, buy=> _.isEqual(buy.userId, user._id)  && buy.selected == 0)
            let buy  = _.filter(buys, buy=> _.isEqual(buy.userId, user._id)  && buy.selected == 1)
            return (
              <div>Book : {book.length}, Buy : {buy.length}</div>
            );
          }
        },
        // {
        //   Header: 'Action',
        //   Cell: props => {
        //     let {_id, name} = props.row.original
        //     return  <div>
        //               <button onClick={()=>{
        //                 history.push({ 
        //                   pathname: "/bank", 
        //                   state: {from: "/", mode: "edit", _id} 
        //                 });
        //               }}>{t("edit")}</button>
        //               <button onClick={(e)=>{
        //                 // setOpenDialogDelete({ isOpen: true, id: _id, description: name })
        //               }}>{t("delete")}</button>
        //             </div>
        //   }
        // },
    ],
    []
  )

  // const [data, setData] = useState(() => makeData(10000))
  // const [originalData] = useState(data)

  // We need to keep the table from resetting the pageIndex when we
  // Update data. So we can keep track of that flag with a ref.
  const skipResetRef = useRef(false)

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex, columnId, value) => {
    skipResetRef.current = true
  }
  //////////////////////

  return (
    <div className="user-list-container">
      {
         loadingBookBuyTransitions
         ?  <CircularProgress /> 
         :  <TableComp
              columns={columns}
              data={datas}
              fetchData={fetchData}
              rowsPerPage={pageOptions}
              updateMyData={updateMyData}
              skipReset={skipResetRef.current}
              isDebug={false}
            />
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
  return { user:state.auth.user }
};

const mapDispatchToProps = { }
export default connect( mapStateToProps, mapDispatchToProps )(BookBuysPage);
