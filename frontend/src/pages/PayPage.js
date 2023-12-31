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

import { queryBuyById } from "../apollo/gqlQuery";
import { getHeaders, handlerErrorApollo } from "../util";
import AttackFileField from "../components/AttackFileField";
import ManageLComp from "../components/ManageLComp"

let initValues = {
  title: "",
  price: 0,
  manageLottery: "",
  description: "",
  files: [],
  statusPay: false
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

const PayPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // let [search, setSearch] = useState(INIT_SEARCH)

  const [input, setInput]       = useState(initValues);
  let [error, setError]         = useState(initValues);
  let [dataBuyById, setDataBuyById] = useState();
  // let [types, setTypes] = useState([{id: 0, name: "bon"}, {id: 1, name: "lang"}]);
  // let [categorys, setCategorys] = useState([{id: 0, name: "money"}, {id: 1, name: "gold"}, 
  //                                           {id: 2, name: "things"}, {id: 3, name: "etc"}]);

  let { id } = location.state
  const { onMutationPay } = props

  useEffect(()=>{ setInput({...input, id}) }, [])

  let { loading: loadingQueryBuyById, 
        data: dataQueryBuyById, 
        error: errorQueryBuyById,
        refetch: refetchQueryBuyById } = useQuery(queryBuyById, 
                                              { 
                                                context: { headers: getHeaders(location) },
                                                fetchPolicy: 'cache-first', 
                                                nextFetchPolicy: 'network-only', 
                                                notifyOnNetworkStatusChange: true 
                                              }
                                            );

  if(!_.isEmpty(errorQueryBuyById)){
    handlerErrorApollo( props, errorQueryBuyById )
  }

  useEffect(()=>{
    if(id){
      refetchQueryBuyById({id});
    }
  }, [id])


  useEffect(()=>{
    if(!loadingQueryBuyById){
      if(!_.isEmpty(dataQueryBuyById?.buyById)){
        let { status, data: dataBuyById } = dataQueryBuyById.buyById
        if(status){
          // setDataBuyById(dataBuyById)

          let { supplier } = dataBuyById

          setInput({
            title: supplier?.title,
            price: supplier?.price,
            manageLottery: supplier?.manageLottery,
            description: dataBuyById.description, 
            files: dataBuyById.files, 
            statusPay: dataBuyById.statusPay, 
          })
        } 
      }
    }
  }, [dataQueryBuyById, loadingQueryBuyById])


  return <div>
          {
            loadingQueryBuyById
            ? <LinearProgress />
            : <div>
                <ManageLComp _id={input.manageLottery}/>
                <div>Title : {input.title}</div>
                <div>Price : {input.price}</div>
                <div>
                  <AttackFileField
                    label={t("attack_file") + " (อย่างน้อย  1 ไฟล์)"}
                    values={input.files}
                    multiple={true}
                    onChange={(values) =>{ setInput({...input, files: values}) } }
                    onSnackbar={(data) => console.log(data) }/>
                </div>
                <div>
                  <FormLabel id="demo-row-radio-buttons-group-label">สถานะการจ่าย</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    onChange={(evt)=>{ setInput({...input, statusPay: !input.statusPay})  }} 
                    value={input.statusPay ? "true" : "false"}>
                    <FormControlLabel value="false" control={<Radio />} label="ค้างจ่าย" />
                    <FormControlLabel value="true" control={<Radio />} label="จ่ายแล้ว" />
                  </RadioGroup>
                </div>
                <div > 
                  <label>{t('detail')}</label>               
                  <textarea 
                  defaultValue={input.description} 
                  rows={4} 
                  cols={40}
                  onChange={(evt)=>{ setInput({...input, description: evt.target.value}) }}/>
                </div>
                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    onClick={evt=>{ onMutationPay({ variables: { input } }); }}
                    disabled={ _.isEmpty(input.files ) || input.description === "" } >{t("pay")}</Button>
              </div>
          }
        </div>

  // return  <form onSubmit={submitForm}>
  //           <div>
  //             <label>ชื่อ * :</label>
  //             <input 
  //               type="text" 
  //               name="title"
  //               value={ _.isEmpty(input.title) ? "" : input.title }
  //               onChange={ onInputChange }
  //               onBlur={ validateInput } />
  //             <p className="text-red-500"> {_.isEmpty(error.title) ? "" : error.title} </p>
  //           </div>
  //           <div>
  //             <label>ราคาสินค้า * :</label>
  //             <input 
  //               type="number" 
  //               name="price"
  //               value={ input.price }
  //               onChange={ onInputChange }
  //               onBlur={ validateInput } />
  //             <p className="text-red-500"> {_.isEmpty(error.price) ? "" : error.price} </p>
  //           </div>
  //           <div>
  //             <label>ขายเบอละ * :</label>
  //             <input 
  //               type="number" 
  //               name="priceUnit"
  //               value={ input.priceUnit }
  //               onChange={ onInputChange }
  //               onBlur={ validateInput } />
  //             <p className="text-red-500"> {_.isEmpty(error.priceUnit) ? "" : error.priceUnit} </p>
  //           </div>
  //           <div>
  //             <label>งวดที่ออกรางวัล * :</label>
  //             {
  //               _.isEmpty(manageLotterys) 
  //               ? <LinearProgress />
  //               : <select 
  //                   name="manageLottery" 
  //                   id="manageLottery" 
  //                   value={ input.manageLottery }
  //                   onChange={ onInputChange }
  //                   onBlur={ validateInput } >
  //                   <option value={""}>ไม่เลือก</option>
  //                   {_.map(manageLotterys, (manageL)=><option value={manageL._id}>{ manageL?.title }</option>)}
  //                 </select>
  //             }
  //             <p className="text-red-500"> {_.isEmpty(error.manageLottery) ? "" : error.manageLottery} </p>
  //           </div>
  //           <div>
  //             <label>ยอดขั้นตํ่า * :</label>
  //             <select 
  //               name="condition" 
  //               id="condition" 
  //               value={input.condition}
  //               onChange={ onInputChange }
  //               onBlur={ validateInput } >
  //               <option value={""}>ไม่เลือก</option>
  //               {_.map(Array(90), (v, k)=> <option value={k+11}>{k+11}</option> )}
  //             </select>  
  //             <p className="text-red-500"> {_.isEmpty(error.condition) ? "" : error.condition} </p>  
  //           </div>
  //           <div>
  //             <label>บน/ล่าง *</label>
  //             <select 
  //               name="type" 
  //               id="type" 
  //               value={input.type}
  //               onChange={ onInputChange }
  //               onBlur={ validateInput } >
  //             <option value={""}>ไม่เลือก</option>
  //             {_.map(types, (val)=><option key={val.id} value={val.id}>{t(val.name)}</option> )}
  //             </select>    
  //             <p className="text-red-500"> {_.isEmpty(error.type) ? "" : error.type} </p>  
  //           </div> 
  //           <div > 
  //             <label>{t('consolation')}</label>               
  //             <textarea 
  //               defaultValue={input.consolation} 
  //               rows={4} 
  //               cols={40}
  //               onChange={(evt)=>{
  //                 setInput({...input, consolation: evt.target.value})
  //               }
  //             } />
  //           </div>
  //           <div>
  //             <label>หมวดหมู่ *</label>
  //             <select 
  //               name="category" 
  //               id="category" 
  //               value={input.category}
  //               onChange={ onInputChange }
  //               onBlur={ validateInput }>
  //             <option value={""}>ไม่เลือก</option>
  //               { _.map(categorys, (val)=><option key={val.id} value={val.id}>{t(val.name)} </option>) }
  //             </select> 
  //             <p className="text-red-500"> {_.isEmpty(error.category) ? "" : error.category} </p>  
  //           </div>   
  //           <div>
  //             <label>จำนวนหวย *</label>
  //             <select 
  //               name="number_lotter" 
  //               id="number_lotter" 
  //               value={input.number_lotter}
  //               onChange={ onInputChange }
  //               onBlur={ validateInput }>
  //             <option value={""}>ไม่เลือก</option>
  //               { _.map([{id: 0, name:"100"}, {id: 1, name:"1000"}], (val)=><option key={val.id} value={val.id}>{t(val.name)} </option>) }
  //             </select> 
  //             <p className="text-red-500"> {_.isEmpty(error.number_lotter) ? "" : error.number_lotter} </p>  
  //           </div>   
  //           <div > 
  //             <label>{t('detail')}</label>               
  //             <textarea 
  //               defaultValue={input.description} 
  //               rows={4} 
  //               cols={40}
  //               onChange={(evt)=>{
  //                 setInput({...input, description: evt.target.value})
  //               }
  //             } />
  //           </div>
  //           <div>
  //             <AttackFileField
  //               label={t("attack_file") + " (อย่างน้อย  1 ไฟล์)"}
  //               values={input.files}
  //               multiple={true}
  //               onChange={(values) =>{
  //                 // console.log("{...input, files: values} :", input, {...input, files: values})
  //                 setInput({...input, files: values})
  //               } }
  //               onSnackbar={(data) => console.log(data) }/>
  //           </div>
  //           <div>
  //             <FormLabel id="demo-row-radio-buttons-group-label">สถานะการขาย</FormLabel>
  //             <RadioGroup
  //               row
  //               aria-labelledby="demo-row-radio-buttons-group-label"
  //               name="row-radio-buttons-group"
  //               onChange={(evt)=>{
  //                 setInput({...input, publish: !input.publish})
  //               }} 
  //               value={input.publish ? "true" : "false"}>
  //               <FormControlLabel value="false" control={<Radio />} label="ปิดการขาย" />
  //               <FormControlLabel value="true" control={<Radio />} label="เปิดการขาย" />
  //             </RadioGroup>
  //           </div>
  //           <Button 
  //             type="submit" 
  //             variant="contained" 
  //             color="primary"
  //             // onClick={evt=>{ submitForm(evt) }}
  //             disabled={   input.title === "" 
  //                         || input.price === "" 
  //                         || input.priceUnit === ""
  //                         || input.description === ""
  //                         || _.isNull(input.manageLottery)
  //                         // || _.isEmpty(input.files ) 
  //                         || input.condition === ""
  //                         || input.category === ""
  //                         || input.type === ""
  //                       }
  //             >{ mode == "edit" ? t("update") : t("create")}
  //           </Button>
  //         </form>
}

export default PayPage;