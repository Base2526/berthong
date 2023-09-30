import React, { useMemo } from "react";
import { styled } from "@mui/material/styles";
import {
  Stack,
  Box,
  Avatar,
  IconButton,
  Typography
} from "@mui/material"
import {
  RemoveCircle as RemoveCircleIcon,
  AddBox as AddBoxIcon
} from '@mui/icons-material'
import _ from "lodash";

const Input = styled("input")({ display: "none" });

const AttackFileField = (props) => {
  let { label, values, multiple, required=false, onChange, onSnackbar } = props

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

  // return  useMemo(() => {
            return (
              <Stack>
                <Typography variant="overline" display="block" gutterBottom>{label}</Typography>
                <label htmlFor="contained-button-file">
                  <Input
                    accept="image/*"
                    id="contained-button-file"
                    name="file"
                    multiple={ _.isNull(multiple) ? true : multiple }
                    type="file"
                    onChange={(e) => {
                      onFileChange(e);
                    }}
                  />
                  {
                    multiple ? 
                      <IconButton
                        color="primary"
                        aria-label="upload picture"
                        component="span">
                        <AddBoxIcon />
                      </IconButton>
                    : values?.length == 0
                      ? <IconButton
                          color="primary"
                          aria-label="upload picture"
                          component="span">
                          <AddBoxIcon />
                        </IconButton>
                      : ""
                  }
                  
                </label>
                <Stack 
                  direction="row"
                  spacing={2}>
                  {_.map(
                    _.filter(values, (v, key) => !v?.delete),
                    (file, index) => {
                      if (!file?.url) {
                        // new file
                        try {
                          return (
                            <Box style={{ position: "relative" }} key={index}>
                              <Avatar
                                sx={{
                                  height: 80,
                                  width: 80,
                                  border: "1px solid #cccccc",
                                  padding: "5px",
                                  marginBottom: "5px"
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
                            </Box>
                          );
                        } catch (e) {
                          console.log('Error :', e)
                          return ""
                        }
                        
                      } else {
                        // old file
                        return (
                          <Box style={{ position: "relative" }} key={index}>
                            <Avatar
                              sx={{
                                height: 80,
                                width: 80,
                                border: "1px solid #cccccc",
                                padding: "5px",
                                marginBottom: "10px"
                              }}
                              variant="rounded"
                              alt="Example Alt"
                              src={file?.url}
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
                          </Box>
                        );
                      }
                    }
                  )}
                </Stack>
              </Stack>
            )
          // }, [values]);
};

export default AttackFileField;
