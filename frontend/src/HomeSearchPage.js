import React, { useState } from "react";
import { ExpandMore as ExpandMoreIcon } from "@material-ui/icons";
import {
  Button,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
  Accordion,
  Input,
  Typography,
  Slider,
  TextField
} from "@material-ui/core";
import Box from "@mui/joy/Box";
import Checkbox, { checkboxClasses } from "@mui/joy/Checkbox";

import _ from "lodash"

const initSearch = {
  number: "",
  title: "",
  detail: "",
  price: 500,
  chkBon: false,
  chkLang: false,
  chkMoney: false,
  chkGold: false
}

const HomeSearchPage = (props) => {
  const { classes, onSearch } = props

  const [search, setSearch] = useState(initSearch)

  const handleSliderChange = (event, newValue) => {
    setSearch({...search, price: newValue})
  };

  const handleInputChange = (event) => {
    setSearch({...search, price: _.isEmpty(event.target.value) ? "" : Number(event.target.value)})
  };

  const handleCheckbox = (event) => {
    setSearch({...search, [event.target.name]: event.target.checked})
  };

  return (<div className={classes.root}>
            <form >
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header">
                  <Typography>
                    <i class="icon icon-search far fas fa-search"></i> Advance search
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    <div className="row m-1">
                      <div className="col-lg-3 col-md-6 col-sm-6 col-12 p-1">
                        <TextField
                          id="standard-basic"
                          label="ตัวเลข"
                          variant="filled"
                          name={"number"}
                          value={search.number}
                          onChange={(evt) => setSearch({...search, number: evt.target.value}) }
                        />
                      </div>
                      <div className="col-lg-3 col-md-6 col-sm-6 col-12 p-1">
                        <TextField
                          id="standard-basic"
                          label="ชื่อ"
                          variant="filled"
                          value={search.title}
                          onChange={(evt) => setSearch({...search, title: evt.target.value}) }
                        />
                      </div>
                      <div className="col-lg-3 col-md-6 col-sm-6 col-12 p-1">
                        <TextField
                          id="standard-basic"
                          label="รายละเอียด"
                          variant="filled"
                          value={search.detail}
                          onChange={(evt) => setSearch({...search, detail: evt.target.value}) }
                        />
                      </div>
                      <div className="col-lg-3 col-md-6 col-sm-6 col-12 p-1">
                        <div>
                          <Slider
                            sx={{ width: "100%" }}
                            // value={typeof price === "number" ? price : 0}
                            value={search.price}
                            onChange={handleSliderChange}
                            aria-labelledby="input-slider"
                            min={10}
                            max={1000}
                          />
                          ราคาไม่เกิน
                          <Input
                            className={classes.input}
                            value={search.price}
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
                      <div className="col-lg-3 col-md-6 col-sm-6 col-12 p-1 m-1">
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Checkbox
                            name="chkBon"
                            label="บน"
                            // defaultChecked
                            checked={search.chkBon}
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
                            name="chkLang"
                            label="ล่าง"
                            // defaultChecked
                            checked={search.chkLang}
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
                            name="chkMoney"
                            label="เงิน"
                            // defaultChecked
                            checked={search.chkMoney}
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
                            name="chkGold"
                            label="ทอง"
                            // defaultChecked
                            checked={search.chkGold}
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
                <AccordionActions className={classes.details}>
                  {
                    _.isEqual(search, initSearch)
                    ? <div />
                    : <div>
                        <div style={{ justifyContent: "flex-start" }}>ผลการค้นหา  { /*totalSearch*/ } </div>
                        <Button
                          className={classes.containedBlueGrey}
                          size="small"
                          onClick={() =>setSearch(initSearch) }>
                          RESET
                        </Button>
                      </div>
                  }
                  <Button
                    size="small"
                    onClick={()=>onSearch(search)}
                    className={classes.containedLightGreen}>
                    SEARCH
                  </Button>
                </AccordionActions>
              </Accordion>
            </form>
          </div>);
};

export default HomeSearchPage;
