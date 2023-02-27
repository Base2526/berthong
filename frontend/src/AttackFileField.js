import React, { useState, useEffect, withStyles } from "react";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import CloseIcon from "@mui/icons-material/Close";
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import _ from "lodash";

const Input = styled("input")({
  display: "none"
});

const AttackFileField = (props) => {

  let { label, values, onChange, onSnackbar } = props

  console.log("inputList > #1: ", values);

  // let [inputList, setInputList] = useState(values);

  // useEffect(() => {
  //   console.log("inputList > #2: ", inputList);

  //   onChange(inputList)
  // }, [inputList]);

  const onFileChange = (e) => {
    let newInputList = [...values];
    for (var i = 0; i < e.target.files.length; i++) {
      let file = e.target.files[i];
      if (file.type) {
        newInputList = [...newInputList, file];
      }
    }
    onChange(newInputList);
  };

  return (
    <Box sx={{ p: 1 }} component="footer">
      <div>
        <Typography variant="overline" display="block" gutterBottom>
          {label}
        </Typography>
        <label htmlFor="contained-button-file">
          <Input
            accept="image/*"
            id="contained-button-file"
            name="file"
            multiple
            type="file"
            onChange={(e) => {
              onFileChange(e);
            }}
          />
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="span"
          >
            <AddBoxIcon />
          </IconButton>
        </label>
      </div>
      <Stack direction="row" spacing={2}>
        {_.map(
          _.filter(values, (v, key) => !v.delete),
          (file, index) => {
            console.log("Stack :", !file.url, file.url);

            if (!file.url) {
              // new file
              try {
                return (
                  <div style={{ position: "relative" }} key={index}>
                    <Avatar
                      sx={{
                        height: 80,
                        width: 80,
                        border: "1px solid #cccccc",
                        padding: "5px"
                      }}
                      variant="rounded"
                      alt="Example Alt"
                      src={URL.createObjectURL(file)}
                    />
                     <IconButton
                      style={{
                        position: "absolute",
                        right: 0,
                        top:0
                      }}
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                      onClick={() => {
                        let newInputList = [
                          ...values.slice(0, index),
                          ...values.slice(index + 1, values.length)
                        ];
  
                        // setInputList(newInputList);
                        onChange(newInputList);
                        onSnackbar({open:true, message:"Delete image"});
                      }}
                    >
                      <RemoveCircleIcon />
                    </IconButton>
                  </div>
                );
              } catch (e) {
                console.log('Error :', e)
                return ""
              }
              
            } else {
              // old file
              return (
                <div style={{ position: "relative" }} key={index}>
                  <Avatar
                    sx={{
                      height: 80,
                      width: 80,
                      border: "1px solid #cccccc",
                      padding: "5px"
                    }}
                    variant="rounded"
                    alt="Example Alt"
                    src={file.url}
                  />
                   <IconButton
                    style={{
                      position: "absolute",
                      right: 0,
                      top:0
                    }}
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    onClick={() => {
                      let newInputList = [...values];
                      
                      // console.log("Delete image : ", inputList, file._id)

                      let i = _.findIndex(newInputList, (v)=>v._id == file._id)
                      newInputList[i] = {
                        ...newInputList[i],
                        delete: true
                      };

                      // setInputList(newInputList);

                      onChange(newInputList);

                      onSnackbar({open:true, message:"Delete image"});
                    }}
                  >
                    <RemoveCircleIcon />
                  </IconButton>
                </div>
              );
            }
          }
        )}
      </Stack>
    </Box>
  );
};

export default AttackFileField;
