import React, { useState, useMemo, useEffect } from "react";
import { ExpandMore as ExpandMoreIcon } from "@material-ui/icons";
import {
  Button,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
  Accordion,
  Typography,
  TextField
} from "@material-ui/core";
import Box from "@mui/joy/Box";
import Checkbox, { checkboxClasses } from "@mui/joy/Checkbox";
import { Stack } from '@mui/material';
import _ from "lodash"
import { useTranslation } from "react-i18next";

import * as Constants from "../constants"

const SearchComp = (props) => {
  let { t } = useTranslation();

  let { classes, search, onSearch, onReset } = props

  let [expanded, setExpanded] = useState( _.isNull(localStorage.getItem('expanded')) ? false : localStorage.getItem('expanded') === 'true' ? true : false )
  let [data, setData] = useState(search)


  useEffect(()=>{
    console.log( "SearchComp expanded :", localStorage.getItem('expanded'), typeof expanded, expanded )
  }, [expanded])
  // const handleSliderChange = (event, newValue) => {
  //   setData({...data, PRICE: newValue})
  // };
  // const handleInputChange = (event) => {
  //   setData({...data, PRICE: _.isEmpty(event.target.value) ? "" : Number(event.target.value)})
  // };

  const handleCheckbox = (event) => {
    setData({...data, [event.target.name]: event.target.checked})
  };

  return  useMemo(() => {
            return  <div className={classes.root}>
                      <form >
                        <Accordion expanded={expanded}  onChange={()=>{
                          setExpanded(!expanded)
                          localStorage.setItem('expanded', !expanded);
                        }}>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header">
                            <Typography>
                              <i className="icon icon-search far fas fa-search"></i> {t("advance_search")}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography>
                              <div className="row m-1">
                                <div className="col-lg-3 col-md-6 col-sm-6 col-12 p-1">
                                  <TextField
                                    id="standard-basic"
                                    label="ตัวเลขต้องการซื้อ"
                                    variant="filled"
                                    placeholder=""
                                    name={"number"}
                                    value={data.NUMBER}
                                    onChange={(evt) => setData({...data, NUMBER: evt.target.value}) } />
                                </div>
                                <div className="col-lg-3 col-md-6 col-sm-6 col-12 p-1">
                                  <TextField
                                    id="standard-basic"
                                    label="ชื่อ"
                                    variant="filled"
                                    value={data.TITLE}
                                    onChange={(evt) => setData({...data, TITLE: evt.target.value}) } />
                                </div>
                                {/* 
                                <div className="col-lg-3 col-md-6 col-sm-6 col-12 p-1">
                                  <TextField
                                    id="standard-basic"
                                    label="รายละเอียด"
                                    variant="filled"
                                    value={data.DETAIL}
                                    onChange={(evt) => setData({...data, DETAIL: evt.target.value}) }
                                  />
                                </div>
                                <div className="col-lg-3 col-md-6 col-sm-6 col-12 p-1">
                                  <div>
                                    <Slider
                                      sx={{ width: "100%" }}
                                      value={data.PRICE}
                                      onChange={handleSliderChange}
                                      aria-labelledby="input-slider"
                                      min={10}
                                      max={1000}
                                    />
                                    ราคาไม่เกิน
                                    <Input
                                      className={classes.input}
                                      value={data.PRICE}
                                      margin="dense"
                                      onChange={handleInputChange}
                                      inputProps={{
                                        step: 10,
                                        min: 0,
                                        max: 100,
                                        type: "number",
                                        "aria-labelledby": "input-slider",
                                        style: { textAlign: "center" }
                                      }}
                                    />
                                    บาท
                                  </div>
                                </div> 
                                */}
                                <div className="col-lg-3 col-md-6 col-sm-6 col-12 p-1 m-1 align-self-center">
                                  <Box sx={{ display: "flex", gap: 2 }}>
                                    {/* <FormControl>
                                      <FormLabel id="demo-controlled-radio-buttons-group">Gender</FormLabel>
                                      <RadioGroup
                                        aria-labelledby="demo-controlled-radio-buttons-group"
                                        name="controlled-radio-buttons-group"
                                        // value={value}
                                        // onChange={handleChange}
                                      >
                                        <FormControlLabel value="female" control={<Radio />} label="Female" />
                                        <FormControlLabel value="male" control={<Radio />} label="Male" />
                                      </RadioGroup>
                                    </FormControl> */}
                                    <Checkbox
                                      name="CHK_BON"
                                      label="บน"
                                      // defaultChecked
                                      checked={data.CHK_BON}
                                      onChange={handleCheckbox}
                                      sx={{
                                        [`& > .${checkboxClasses.checkbox}`]: {}
                                      }}
                                      // to demonstrate the focus outline
                                      slotProps={{
                                        action: {
                                          className: checkboxClasses.focusVisible
                                        }
                                      }}
                                    />
                                    <Checkbox
                                      name="CHK_LAND"
                                      label="ล่าง"
                                      // defaultChecked
                                      checked={data.CHK_LAND}
                                      onChange={handleCheckbox}
                                      sx={{
                                        [`& > .${checkboxClasses.checkbox}`]: {}
                                      }}
                                      // to demonstrate the focus outline
                                      slotProps={{
                                        action: {
                                          className: checkboxClasses.focusVisible
                                        }
                                      }}
                                    />
                                    <Checkbox
                                      name="CHK_MONEY"
                                      label="เงิน"
                                      // defaultChecked
                                      checked={data.CHK_MONEY}
                                      onChange={handleCheckbox}
                                      color="warning"
                                      sx={{
                                        [`& > .${checkboxClasses.checkbox}`]: {}
                                      }}
                                      // to demonstrate the focus outline
                                      slotProps={{
                                        action: {
                                          className: checkboxClasses.focusVisible
                                        }
                                      }}
                                    />
                                    <Checkbox
                                      name="CHK_GOLD"
                                      label="ทอง"
                                      // defaultChecked
                                      checked={data.CHK_GOLD}
                                      onChange={handleCheckbox}
                                      color="warning"
                                      sx={{
                                        [`& > .${checkboxClasses.checkbox}`]: {}
                                      }}
                                      // to demonstrate the focus outline
                                      slotProps={{
                                        action: {
                                          className: checkboxClasses.focusVisible
                                        }
                                      }}
                                    />

                                    {/* <Box role="group" aria-labelledby="topping">
                                    <List
                                      orientation="horizontal"
                                      wrap
                                      sx={{
                                        "--List-gap": "8px",
                                        "--List-item-radius": "15px"
                                      }}
                                    > */}
                                    {/* {["บน", "ล่าง"].map((item, index) => (
                                        <ListItem key={item}>
                                          <Checkbox
                                            overlay
                                            disableIcon
                                            variant="soft"
                                            label={item}
                                          />
                                        </ListItem>
                                      ))}
                                      {["เงิน", "ทอง"].map((item, index) => (
                                        <ListItem key={item}>
                                          <Checkbox
                                            overlay
                                            disableIcon
                                            variant="soft"
                                            label={item}
                                          />
                                        </ListItem>
                                      ))} */}
                                    {/* </List>
                                  </Box> */}
                                  </Box>
                                </div>
                              </div>
                            </Typography>
                          </AccordionDetails>
                          
                            {
                              data.NUMBER === "" && data.TITLE === "" && !data.CHK_BON &&  !data.CHK_LAND && !data.CHK_MONEY && !data.CHK_GOLD
                              ? <div />
                              : <AccordionActions className={classes.details}>
                                  <Stack direction="row" spacing={2} alignItems="flex-end">
                                    <div style={{ justifyContent: "flex-start" }}>ผลการค้นหา  { /*totalSearch*/ } </div>
                                    <Button
                                      className={classes.containedBlueGrey}
                                      size="small"
                                      onClick={() =>{ 
                                        setData(Constants.INIT_SEARCH)
                                        onReset()
                                      }}>
                                      RESET
                                    </Button>
                                    <Button
                                      size="small"
                                      onClick={()=>onSearch(data)}
                                      className={classes.containedLightGreen}>
                                      SEARCH
                                    </Button>
                                  </Stack>
                                </AccordionActions>
                            }
                        </Accordion>
                      </form>
                    </div>
          }, [data.NUMBER, data.TITLE, data.CHK_BON, data.CHK_LAND, data.CHK_MONEY, data.CHK_GOLD , expanded]);
}

export default SearchComp;
