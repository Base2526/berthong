import { Link } from "react-router-dom";
import { useState, useContext, useEffect, useMemo, useRef, useCallback } from "react";
import { useHistory } from "react-router-dom";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from "@mui/material/Avatar";
import _ from "lodash"
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { useQuery, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { queryDateLotterys } from "./gqlQuery"
import Table from "./TableContainer"

const DateLotterysPage = (props) => {
  let history = useHistory();
  const { t } = useTranslation();

  const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  const [pageIndex, setPageIndex] = useState(0);  
  const [pageSize, setPageSize] = useState(pageOptions[0])

  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  const dateLotterysValues = useQuery(queryDateLotterys, { notifyOnNetworkStatusChange: true });

  console.log("dateLotterysValues :", dateLotterysValues)

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
        },
        {
          Header: 'Start date',
          accessor: 'startDate',
          Cell: props =>{
            let {startDate} = props.row.values 
            // return <div>{ (moment(startDate, 'YYYY-MM-DD HH:mm')).format('DD MMM, YYYY HH:mm A')}</div>

            startDate = new Date(startDate).toLocaleString('en-US', { timeZone: 'asia/bangkok' });

            // console.log("startDate :", startDate)
            return <div>{ (moment(startDate, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</div>
          }
        },
        {
          Header: 'End date',
          accessor: 'endDate',
          Cell: props =>{
            let {endDate} = props.row.values 

            endDate = new Date(endDate).toLocaleString('en-US', { timeZone: 'asia/bangkok' });

            // console.log("endDate :", endDate)
            return <div>{ (moment(endDate, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</div>
          }
        },
        {
          Header: 'Description',
          accessor: 'description',
          Cell: props => {
            return (
              <Box
                sx={{
                  maxHeight: "inherit",
                  width: "100%",
                  whiteSpace: "initial",
                  lineHeight: "16px"
                }}
              >
                <Typography
                  variant="body1"
                  gutterBottom
                  dangerouslySetInnerHTML={{
                    __html: props.row.original.description
                  }}
                />
              </Box>
            );
          }
        },
        {
          Header: 'Action',
          Cell: props => {
            console.log("Cell :", props)

            let {_id, name} = props.row.original
            return  <div>
                      <button onClick={()=>{
                        history.push({ 
                          pathname: "/date-lottery", 
                          state: {from: "/", mode: "edit", _id} 
                        });
                      }}>{t("edit")}</button>
                      <button onClick={(e)=>{
                        // setOpenDialogDelete({ isOpen: true, id: _id, description: name })
                      }}>{t("delete")}</button>
                    </div>
          }
        },
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
         dateLotterysValues.loading
         ?  <div><CircularProgress /></div> 
         :  <Table
              columns={columns}
              data={dateLotterysValues.data.dateLotterys.data}
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

      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClick={(e)=>{
          history.push({ 
            pathname: "/date-lottery", 
            state: {from: "/", mode: "new"} 
          });
        }}
      />
    </div>
  );
};

export default DateLotterysPage;
