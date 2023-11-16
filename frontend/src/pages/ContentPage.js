import React, { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {  Button, 
          LinearProgress, 
          Radio,
          RadioGroup,
          FormControlLabel,
          FormControl,
          FormLabel
         } from '@mui/material';
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { slateToHtml, htmlToSlate, slateToDom } from 'slate-serializers'

import { queryManageSuppliers, queryContentById, querySupplierById, mutationLottery } from "../apollo/gqlQuery";
import { getHeaders, handlerErrorApollo } from "../util";
import AttackFileField from "../components/AttackFileField";

// import Editor from "../components/editable/SlateEditor/Editor";
import TextEditor from "../components/editable/SlateEditor2/Editor";

let initValues = {
  title: "", 
  description: '<p></p>',
}

const ContentPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [input, setInput]       = useState(initValues);
  let [error, setError]         = useState(initValues);
  // let [manageLotterys, onMutationContent] = useState([]);

  const [text, setText] = useState("");

  let { mode } = location?.state
  const { onMutationContent } = props

  let { loading: loadingContentById, 
        data: dataContentById, 
        error: errorContentById,
        refetch: refetchContentById } = useQuery(queryContentById, 
                                              { 
                                                context: { headers: getHeaders(location) },
                                                fetchPolicy: 'cache-first', 
                                                nextFetchPolicy: 'network-only', 
                                                notifyOnNetworkStatusChange: true 
                                              }
                                            );

  if(!_.isEmpty(errorContentById)){
    handlerErrorApollo( props, errorContentById )
  }

  // let { loading: loadingSupplierById, 
  //       data: dataSupplierById, 
  //       error: errorSupplierById,
  //       refetch: refetchSupplierById } =  useQuery(querySupplierById, {
  //                                                 context: { headers: getHeaders(location) },
  //                                                 // variables: {id},
  //                                                 fetchPolicy: 'cache-first', 
  //                                                 nextFetchPolicy: 'network-only', 
  //                                                 notifyOnNetworkStatusChange: true,
  //                                               })
  // if(!_.isEmpty(errorSupplierById)){
  //   handlerErrorApollo( props, errorSupplierById )
  // }
  // useEffect(()=>{
  //   if( !loadingSupplierById && mode == "edit"){
  //     if(!_.isEmpty(dataSupplierById?.supplierById)){
  //       let { status, data } = dataSupplierById.supplierById
  //       if(status){
  //         setInput({
  //           title: data.title, 
  //           description: data.description, 
  //         })
  //       }
  //     }
  //   }
  // }, [dataSupplierById, loadingSupplierById])

  useEffect(()=>{
    if(mode == "edit" && location?.state?.id){
      refetchContentById({id: location?.state?.id});
    }
  }, [location?.state?.id])

  useEffect(()=>{
    console.log("input :", input)
  }, [input])

  useEffect(()=>{
    if(!loadingContentById){
      if(!_.isEmpty(dataContentById?.contentById)){
        let { status, data } = dataContentById.contentById
        console.log("")
        // if(status){
        //   if(!_.isEqual( manageLotterys, newManageLotterys ))setManageLotterys(newManageLotterys)
        // } 
      }
    }
  }, [dataContentById, loadingContentById])

  const handleChange = (e) => {
    console.log("slateToHtml(e) :", slateToHtml(e), e, slateToDom(e))
    setInput({...input, description: slateToHtml(e)})
  };

  const submitForm = async(event) => {
    event.preventDefault();

    let newInput =  {
        mode: mode.toUpperCase(),
        title: input.title,
        description: input.description,
    }

    if(mode == "edit"){
      newInput = {...newInput, _id: location?.state?.id}
    }
    onMutationContent({ variables: { input: newInput } });
  }

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value
    }));
    validateInput(e);
  };

  const validateInput = (e) => {
    let { name, value } = e.target;
    setError((prev) => {
      const objs = { ...prev, [name]: "" };
      switch (name) {
        case "title": {
          if (!value) {
            objs[name] = "Please enter title.";
          }
          break;
        }

        default:
          break;
      }

      return objs;
    });
  };

  return  <div>
            <div>
              <label>ชื่อ * :</label>
              <input 
                type="text" 
                name="title"
                value={ _.isEmpty(input.title) ? "" : input.title }
                onChange={ onInputChange }
                onBlur={ validateInput } />
              <p className="text-red-500"> {_.isEmpty(error.title) ? "" : error.title} </p>
            </div>
            <div>
              <label>{t('detail')} :</label>
              <TextEditor
                text={htmlToSlate(input.description)}
                onChange={handleChange}
              />
            </div>
            <Button 
              variant="contained" 
              color="primary"
              onClick={(e)=>submitForm(e)}
              disabled={ input.title === "" }>{ mode == "edit" ? t("update") : t("create")}
            </Button>
          </div>
}

export default ContentPage;