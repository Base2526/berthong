import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import _ from "lodash"
import {
  Box,
  Typography,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
  CircularProgress,
  SpeedDialIcon,
  SpeedDial,
  Stack
} from '@mui/material';
import {  DeleteForever as DeleteForeverIcon, 
          Edit as EditIcon } from '@mui/icons-material';

import { useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { queryBanks } from "./gqlQuery"
import TableComp from "./components/TableComp"

const BanksPage = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  const [pageIndex, setPageIndex] = useState(0);  
  const [pageSize, setPageSize] = useState(pageOptions[0])

  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  const bankValues = useQuery(queryBanks,  { notifyOnNetworkStatusChange: true });

  console.log("bankValues :", bankValues)

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
          Header: 'Name',
          accessor: 'name',
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
            return  <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="center"
                      alignItems="center">
                      <button onClick={()=>{
                        navigate("/bank", {state: {from: "/", mode: "edit", _id}})
                      }}><EditIcon/>{t("edit")}</button>
                      <button onClick={(e)=>{
                        // setOpenDialogDelete({ isOpen: true, id: _id, description: name })
                      }}><DeleteForeverIcon/>{t("delete")}</button>
                    </Stack>
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
    console.log("updateMyData")
    // We also turn on the flag to not reset the page
    skipResetRef.current = true
    // setData(old =>
    //   old.map((row, index) => {
    //     if (index === rowIndex) {
    //       return {
    //         ...row,
    //         [columnId]: value,
    //       }
    //     }
    //     return row
    //   })
    // )
  }
  //////////////////////

  return (
    <div>
      {
         bankValues.loading
         ?  <div><CircularProgress /></div> 
         :  <TableComp
              columns={columns}
              data={bankValues.data.banks.data}
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

          // history.push({ 
          //   pathname: "/bank", 
          //   state: {from: "/", mode: "new"} 
          // });
          navigate("/bank", {state: {from: "/", mode: "new"} })
        }}
      />
    </div>
  );
};

export default BanksPage;
