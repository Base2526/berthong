import React, { useState, useEffect } from "react";
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { useQuery } from "@apollo/client";
import { useLocation } from "react-router-dom";
import {
  Stack,
  LinearProgress,
  IconButton,
  Autocomplete,
  TextField,
  Typography
} from '@mui/material'
import { useTranslation } from "react-i18next";
import _ from "lodash"

const InputPasswordField = (props) => {
  const location = useLocation();
  const { t }    = useTranslation();
  return  <Stack direction="column" spacing={2} alignItems="flex-start">InputPasswordField</Stack>
};

export default InputPasswordField;
