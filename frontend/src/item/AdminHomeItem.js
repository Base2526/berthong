import React, { useState } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";
import {
  MoreVert as MoreVertIcon,
} from "@material-ui/icons";
import {
  Card,
  CardActions,
  CardContent,
  Typography,
  Button
} from "@mui/material";

import {
  ContentCopy as ContentCopyIcon,
  BugReport as BugReportIcon
} from "@mui/icons-material"
import _ from "lodash"

const AdminHomeItem = (props) => {
  const navigate = useNavigate();

  const { item } = props
  return (<Card>
            <CardContent>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                {item}
              </Typography>
              {/* <Typography variant="h5" component="div">
                belent
              </Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                adjective
              </Typography>
              <Typography variant="body2">
                well meaning and kindly.
                <br />
                {'"a benevolent smile"'}
              </Typography> */}
            </CardContent>
          </Card>)
}

export default AdminHomeItem;
