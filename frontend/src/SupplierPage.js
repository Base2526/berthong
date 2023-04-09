import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {Box ,LinearProgress} from '@mui/material';
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

import { mutationSupplier, queryDateLotterys, querySupplierById } from "./gqlQuery";
import { getHeaders, showToast } from "./util";
import AttackFileField from "./AttackFileField";
import { FORCE_LOGOUT, DATA_NOT_FOUND, UNAUTHENTICATED, ERROR } from "./constants"
import { logout } from "./redux/actions/auth";

let initValues = {
  title: "", 
  price: "", 
  priceUnit: "",
  description: "",
  dateLottery: null,
  files: [],
  condition: "",       // 11-100
  category: "",        // 0: money, 1: gold, 2 : things, 3 : etc
  type: "",            // 0: bon, 1 : lang
}

const SupplierPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  let [input, setInput]       = useState(initValues);
  let [error, setError]       = useState(initValues);
  let [dateLotterysValues, setDateLotterysValues] = useState([]);
  let [types, setTypes] = useState([{id: 0, name: "bon"}, {id: 1, name: "lang"}]);
  let [categorys, setCategorys] = useState([{id: 0, name: "money"}, {id: 1, name: "gold"}, 
                                            {id: 2, name: "things"}, {id: 3, name: "etc"}]);

  let { mode, id } = location.state
  const { logout } = props

  let { loading: loadingDateLotterys, 
        data: dataDateLotterys, 
        error: errorDateLotterys } = useQuery(queryDateLotterys, { 
                                              context: { headers: getHeaders(location) },
                                              fetchPolicy: 'network-only', // Used for first execution
                                              nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                              notifyOnNetworkStatusChange: true });

  let { loading: loadingSupplierById, 
        data: dataSupplierById, 
        error: errorSupplierById,
        refetch: refetchSupplierById } =  useQuery(querySupplierById, {
                                                  context: { headers: getHeaders(location) },
                                                  variables: {id},
                                                  fetchPolicy: 'network-only', // Used for first execution
                                                  nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                                  notifyOnNetworkStatusChange: true,
                                                })

  const [onMutationSupplier, resultSupplier] = useMutation(mutationSupplier, {
    context: { headers: getHeaders(location) },
    update: (cache, {data: {supplier}}) => {
      let { data, mode, status } = supplier

      // if(status){
      //   switch(mode){
      //     case "new":{
      //       const querySuppliersValue = cache.readQuery({ query: querySuppliers });

      //       if(!_.isNull(querySuppliersValue)){
      //         let newData = [...querySuppliersValue.suppliers.data, data];

      //         cache.writeQuery({
      //           query: querySuppliers,
      //           data: { suppliers: {...querySuppliersValue.suppliers, data: newData} }
      //         });
      //       }
      //       break;
      //     }
      //     case "edit":{
      //       const querySuppliersValue = cache.readQuery({ query: querySuppliers });
      //       if(!_.isNull(querySuppliersValue)){
      //         let newData = _.map(querySuppliersValue.suppliers.data, (item)=> item._id == data._id ? data : item ) 

      //         cache.writeQuery({
      //           query: querySuppliers,
      //           data: { suppliers: {...querySuppliersValue.suppliers, data: newData} }
      //         });
      //       }
      //       break;
      //     }
      //   }
      // }
    },
    onCompleted(data) {
      navigate(-1)
    },
    onError(error){
      _.map(error?.graphQLErrors, (e)=>{
        switch(e?.extensions?.code){
          case FORCE_LOGOUT:{
            logout()
            break;
          } 
          case DATA_NOT_FOUND:
          case UNAUTHENTICATED:
          case ERROR:{
            showToast("error", e?.message)
            break;
          }
        }
      })
    }
  });

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
            dateLottery: data.dateLottery, 
            files: data.files, 
            condition: data.condition,  // 11-100
            category: data.category,    // money, gold, things, etc
            type: data.type,            // bon, lang
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
    if(!loadingDateLotterys){
      if(!_.isEmpty(dataDateLotterys?.dateLotterys)){
        let { status, data } = dataDateLotterys.dateLotterys
        if(status) setDateLotterysValues(data)
      }
    }
  }, [dataDateLotterys, loadingDateLotterys])

  const submitForm = async(event) => {
    event.preventDefault();

    let newInput =  {
        mode: mode.toUpperCase(),
        title: input.title,
        price: parseInt(input.price),
        priceUnit: parseInt(input.priceUnit),
        description: input.description,
        dateLottery: input.dateLottery,
        files: input.files,
        condition: parseInt(input.condition),    // 11-100
        category: parseInt(input.category),      // money, gold, things, etc
        type: parseInt(input.type)               // bon, lang
    }

    if(mode == "edit"){
      newInput = {...newInput, _id: id}
    }

    // console.log("submitForm", newInput)
    onMutationSupplier({ variables: { input: newInput } });
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
      const stateObj = { ...prev, [name]: "" };
      switch (name) {
        case "title": {
          if (!value) {
            stateObj[name] = "Please enter title.";
          }
          break;
        }

        case "price": {
          if (!value) {
            stateObj[name] = "Please enter price.";
          }
          break;
        }

        case "priceUnit": {
          if (!value) {
            stateObj[name] = "Please enter price unit.";
          } 

          break;
        }

        case "dateLottery":{
          if (!value) {
            stateObj[name] = "Please enter date-lottery.";
          } 
          break;
        }
        case "condition":{
          if (!value) {
            stateObj[name] = "Please enter condition.";
          } 
          break;
        }
        case "type":{
          if (!value) {
            stateObj[name] = "Please enter type.";
          } 
          break;
        }
        case "category":{
          if (!value) {
            stateObj[name] = "Please enter category.";
          } 
          break;
        }

        default:
          break;
      }

      return stateObj;
    });
  };

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
                _.isEmpty(dateLotterysValues) 
                ? <LinearProgress />
                : <select 
                    name="dateLottery" 
                    id="dateLottery" 
                    value={input.dateLottery}
                    onChange={ onInputChange }
                    onBlur={ validateInput } >
                    <option value={""}>ไม่เลือก</option>
                    {_.map(dateLotterysValues, (dateLotterysValue)=>{

                      // let {date} = props.row.original 
                      let date = new Date(dateLotterysValue.date).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
                      // return <div>งวดวันที่ { (moment(date, 'MM/DD/YYYY')).format('DD MMM, YYYY')}</div>

                      return <option value={dateLotterysValue._id}>งวดวันที่ { (moment(date, 'MM/DD/YYYY')).format('DD MMM, YYYY')}</option>
                    })}
                  </select>
              }
              <p className="text-red-500"> {_.isEmpty(error.dateLottery) ? "" : error.dateLottery} </p>
            </div>
            <div>
              <label>ขั้นตอนการขาย * :</label>
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
              {_.map(types, (val)=><option key={val.id} value={val.id}>{val.name}</option> )}
              </select>    
              <p className="text-red-500"> {_.isEmpty(error.type) ? "" : error.type} </p>  
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
                { _.map(categorys, (val)=><option key={val.id} value={val.id}>{val.name}</option>) }
              </select> 
              <p className="text-red-500"> {_.isEmpty(error.category) ? "" : error.category} </p>  
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
            <div >
              <AttackFileField
                label={t("attack_file") + " (อย่างน้อย  1 ไฟล์)"}
                values={input.files}
                onChange={(values) => setInput({...input, files: values})}
                onSnackbar={(data) => console.log(data) }/>
            </div>
            <button type="submit" variant="contained" color="primary"> { mode == "edit" ? t("update") : t("create")}</button>
          </form>
}

const mapStateToProps = (state, ownProps) => {
  return {user: state.auth.user}
}

const mapDispatchToProps = {
  logout
}

export default connect( mapStateToProps, mapDispatchToProps )(SupplierPage);