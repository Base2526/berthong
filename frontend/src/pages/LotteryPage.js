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

import { queryManageSuppliers, queryManageLotterys, querySupplierById, mutationLottery } from "../apollo/gqlQuery";
import { getHeaders, handlerErrorApollo } from "../util";
import AttackFileField from "../components/AttackFileField";

let initValues = {
  title: "", 
  price: "", 
  priceUnit: "",
  description: "",
  manageLottery: null,
  files: [],
  condition: "",       // 11-100
  category: "",        // 0: money, 1: gold, 2 : things, 3 : etc
  type: "",            // 0: bon, 1 : lang
  consolation: "",
  number_lotter: 0,    // 0: 100, 1: 1000
  publish: false
}

const INIT_SEARCH = {
  PAGE: 1,
  LIMIT: 1000,
  NUMBER: "",
  TITLE: "",
  DETAIL: "",
  PRICE: 500,
  CHK_BON: false,
  CHK_LAND: false,
  CHK_MONEY: false,
  CHK_GOLD: false
}

const LotteryPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  let [search, setSearch] = useState(INIT_SEARCH)

  const [input, setInput]       = useState(initValues);
  let [error, setError]         = useState(initValues);
  let [manageLotterys, setManageLotterys] = useState([]);
  let [types, setTypes] = useState([{id: 0, name: "bon"}, {id: 1, name: "lang"}, {id: 2, name: "couple"}]);
  let [categorys, setCategorys] = useState([{id: 0, name: "money"}, {id: 1, name: "gold"}, 
                                            {id: 2, name: "things"}, {id: 3, name: "etc"}]);

  let { mode, id } = location.state
  const { onMutationLottery } = props

  // const [onMutationLottery, resultLottery] = useMutation(mutationLottery, {
  //   context: { headers: getHeaders(location) },
  //   update: (cache, {data : {lottery} }, context) => {
  //     let { status, data } = lottery
  //     console.log("data :", data, context)

  //     if(status){
  //       let { variables } = context
  //       switch(variables?.input?.mode.toUpperCase()){
  //         case "NEW":{
  //           const manageSuppliersValue = cache.readQuery({ query: queryManageSuppliers /*, variables: { input: search } */ });
  //           if(!_.isNull(manageSuppliersValue)){
  //             let newData = [...manageSuppliersValue.manageSuppliers.data, data];
  //             cache.writeQuery({
  //               query: queryManageSuppliers,
  //               // variables: { input: search },
  //               data: { manageSuppliers: {...manageSuppliersValue.manageSuppliers, data: newData} }
  //             });
  //           }
  //           break;
  //         }

  //         case "EDIT":{
  //           const manageSuppliersValue = cache.readQuery({ query: queryManageSuppliers /*, variables: { input: search } */  });
  //           if(!_.isNull(manageSuppliersValue)){
  //             let newData = _.map(manageSuppliersValue.manageSuppliers.data, (item)=> item._id == data._id ? data : item ) 
  //             cache.writeQuery({
  //               query: queryManageSuppliers,
  //               // variables: { input: search },
  //               data: { manageSuppliers: {...manageSuppliersValue.manageSuppliers, data: newData} }
  //             });
  //           }
  //           break;
  //         }
  //       }
  //     }
  //   },
  //   onCompleted(data) {
  //     navigate(-1)
  //   },
  //   onError(error){
  //     return handlerErrorApollo( props, error )
  //   }
  // });

  let { loading: loadingManageLotterys, 
        data: dataManageLotterys, 
        error: errorManageLotterys } = useQuery(queryManageLotterys, 
                                              { 
                                                context: { headers: getHeaders(location) },
                                                fetchPolicy: 'cache-first', 
                                                nextFetchPolicy: 'network-only', 
                                                notifyOnNetworkStatusChange: true 
                                              }
                                            );

  if(!_.isEmpty(errorManageLotterys)){
    handlerErrorApollo( props, errorManageLotterys )
  }

  let { loading: loadingSupplierById, 
        data: dataSupplierById, 
        error: errorSupplierById,
        refetch: refetchSupplierById } =  useQuery(querySupplierById, {
                                                  context: { headers: getHeaders(location) },
                                                  variables: {id},
                                                  fetchPolicy: 'cache-first', 
                                                  nextFetchPolicy: 'network-only', 
                                                  notifyOnNetworkStatusChange: true,
                                                })

  if(!_.isEmpty(errorSupplierById)){
    handlerErrorApollo( props, errorSupplierById )
  }

  useEffect(()=>{
    if( !loadingSupplierById && mode == "edit"){
      if(!_.isEmpty(dataSupplierById?.supplierById)){
        let { status, data } = dataSupplierById.supplierById
        if(status){
          setInput({
            title: data.title, 
            price: data.price, 
            priceUnit: data.priceUnit, 
            description: data.description, 
            consolation: data.consolation,
            manageLottery: data.manageLottery?._id, 
            files: data.files, 
            condition: data.condition,  // 11-100
            number_lotter: data.number_lotter ? data.number_lotter : 0,
            category: data.category,    // money, gold, things, etc
            type: data.type,            // bon, lang
            publish: data.publish
          })
        }
      }
    }
  }, [dataSupplierById, loadingSupplierById])

  useEffect(()=>{
    if(mode == "edit" && id){
      refetchSupplierById({id});
    }
  }, [id])

  useEffect(()=>{
    console.log("input :", input)
  }, [input])

  useEffect(()=>{
    if(!loadingManageLotterys){
      if(!_.isEmpty(dataManageLotterys?.manageLotterys)){
        let { status, data:newManageLotterys } = dataManageLotterys.manageLotterys
        if(status){
          if(!_.isEqual( manageLotterys, newManageLotterys ))setManageLotterys(newManageLotterys)
        } 
      }
    }
  }, [dataManageLotterys, loadingManageLotterys])

  const submitForm = async(event) => {
    event.preventDefault();

    let newInput =  {
        mode: mode.toUpperCase(),
        title: input.title,
        price: parseInt(input.price),
        priceUnit: parseInt(input.priceUnit),
        description: input.description,
        consolation: input.consolation,
        manageLottery: input.manageLottery,
        files: input.files,
        condition: parseInt(input.condition),    // 11-100
        number_lotter: parseInt(input.number_lotter),    // 0: 100, 1 : 1000
        category: parseInt(input.category),      // money, gold, things, etc
        type: parseInt(input.type),               // bon, lang
        publish: input.publish
    }

    /*
    mode: SupplierModeType!
    _id: ID
    title: String!
    price: Int!
    priceUnit: Int!
    description: String
    dateLottery: ID!
    files: [JSON]
    condition: Int!
    category: Int!
    type: Int!
    buys: [JSON]
    publish: Boolean = false
    test: Boolean = false
    ownerId: ID
    */
    // console.log("newInput :", newInput)

    if(mode == "edit"){
      newInput = {...newInput, _id: id}
    }
    onMutationLottery({ variables: { input: newInput } });
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

        case "price": {
          if (!value) {
            objs[name] = "Please enter price.";
          }
          break;
        }

        case "priceUnit": {
          if (!value) {
            objs[name] = "Please enter price unit.";
          } 

          break;
        }

        case "manageLottery":{
          if (!value) {
            objs[name] = "Please enter date-lottery.";
          } 
          break;
        }

        case "condition":{
          if (!value) {
            objs[name] = "Please enter condition.";
          } 
          break;
        }

        case "type":{
          if (!value) {
            objs[name] = "Please enter type.";
          } 
          break;
        }

        case "category":{
          if (!value) {
            objs[name] = "Please enter category.";
          } 
          break;
        }

        default:
          break;
      }

      return objs;
    });
  };

  // return  useMemo(() => {
  return  <form onSubmit={submitForm}>
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
              <label>ราคาสินค้า * :</label>
              <input 
                type="number" 
                name="price"
                value={ input.price }
                onChange={ onInputChange }
                onBlur={ validateInput } />
              <p className="text-red-500"> {_.isEmpty(error.price) ? "" : error.price} </p>
            </div>
            <div>
              <label>ขายเบอละ * :</label>
              <input 
                type="number" 
                name="priceUnit"
                value={ input.priceUnit }
                onChange={ onInputChange }
                onBlur={ validateInput } />
              <p className="text-red-500"> {_.isEmpty(error.priceUnit) ? "" : error.priceUnit} </p>
            </div>
            <div>
              <label>งวดที่ออกรางวัล * :</label>
              {
                _.isEmpty(manageLotterys) 
                ? <LinearProgress />
                : <select 
                    name="manageLottery" 
                    id="manageLottery" 
                    value={ input.manageLottery }
                    onChange={ onInputChange }
                    onBlur={ validateInput } >
                    <option value={""}>ไม่เลือก</option>
                    {_.map(manageLotterys, (manageL)=><option value={manageL._id}>{ manageL?.title }</option>)}
                  </select>
              }
              <p className="text-red-500"> {_.isEmpty(error.manageLottery) ? "" : error.manageLottery} </p>
            </div>
            <div>
              <label>ยอดขั้นตํ่า * :</label>
              <select 
                name="condition" 
                id="condition" 
                value={input.condition}
                onChange={ onInputChange }
                onBlur={ validateInput } >
                <option value={""}>ไม่เลือก</option>
                {_.map(Array(90), (v, k)=> <option value={k+11}>{k+11}</option> )}
              </select>  
              <p className="text-red-500"> {_.isEmpty(error.condition) ? "" : error.condition} </p>  
            </div>
            <div>
              <label>บน/ล่าง *</label>
              <select 
                name="type" 
                id="type" 
                value={input.type}
                onChange={ onInputChange }
                onBlur={ validateInput } >
              <option value={""}>ไม่เลือก</option>
              {_.map(types, (val)=><option key={val.id} value={val.id}>{t(val.name)}</option> )}
              </select>    
              <p className="text-red-500"> {_.isEmpty(error.type) ? "" : error.type} </p>  
            </div> 

            {/* consolation */}
            <div > 
              <label>{t('consolation')}</label>               
              <textarea 
                defaultValue={input.consolation} 
                rows={4} 
                cols={40}
                onChange={(evt)=>{
                  setInput({...input, consolation: evt.target.value})
                }
              } />
            </div>
            <div>
              <label>หมวดหมู่ *</label>
              <select 
                name="category" 
                id="category" 
                value={input.category}
                onChange={ onInputChange }
                onBlur={ validateInput }>
              <option value={""}>ไม่เลือก</option>
                { _.map(categorys, (val)=><option key={val.id} value={val.id}>{t(val.name)} </option>) }
              </select> 
              <p className="text-red-500"> {_.isEmpty(error.category) ? "" : error.category} </p>  
            </div>   
            {/* number_lotter */}
            <div>
              <label>จำนวนหวย *</label>
              <select 
                name="number_lotter" 
                id="number_lotter" 
                value={input.number_lotter}
                onChange={ onInputChange }
                onBlur={ validateInput }>
              <option value={""}>ไม่เลือก</option>
                { _.map([{id: 0, name:"100"}, {id: 1, name:"1000"}], (val)=><option key={val.id} value={val.id}>{t(val.name)} </option>) }
              </select> 
              <p className="text-red-500"> {_.isEmpty(error.number_lotter) ? "" : error.number_lotter} </p>  
            </div>   
            <div > 
              <label>{t('detail')}</label>               
              <textarea 
                defaultValue={input.description} 
                rows={4} 
                cols={40}
                onChange={(evt)=>{
                  setInput({...input, description: evt.target.value})
                }
              } />
            </div>
            <div>
              <AttackFileField
                label={t("attack_file") + " (อย่างน้อย  1 ไฟล์)"}
                values={input.files}
                multiple={true}
                onChange={(values) =>{
                  // console.log("{...input, files: values} :", input, {...input, files: values})
                  setInput({...input, files: values})
                } }
                onSnackbar={(data) => console.log(data) }/>
            </div>
            <div>
              <FormLabel id="demo-row-radio-buttons-group-label">สถานะการขาย</FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                onChange={(evt)=>{
                  setInput({...input, publish: !input.publish})
                }} 
                value={input.publish ? "true" : "false"}>
                <FormControlLabel value="false" control={<Radio />} label="ปิดการขาย" />
                <FormControlLabel value="true" control={<Radio />} label="เปิดการขาย" />
              </RadioGroup>
            </div>
            {/* <button type="submit" variant="contained" color="primary"> { mode == "edit" ? t("update") : t("create")}</button> */}
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              // onClick={evt=>{ submitForm(evt) }}
              disabled={   input.title === "" 
                          || input.price === "" 
                          || input.priceUnit === ""
                          || input.description === ""
                          || _.isNull(input.manageLottery)
                          // || _.isEmpty(input.files ) 
                          || input.condition === ""
                          || input.category === ""
                          || input.type === ""
                        }
              >{ mode == "edit" ? t("update") : t("create")}
            </Button>
          </form>
          // }, [ input, dateLotterysValues ]);
}

export default LotteryPage;