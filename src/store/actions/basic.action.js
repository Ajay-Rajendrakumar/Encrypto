import * as types from './types';
import { pythonUrl } from '../../config';
import Axios from 'axios';

let api={
  "login":"/userLogin",
  "signin":"/userSignin",
  "uploadInvoice":"/uploadInvoice",
  "invoiceList":"/invoiceList",
  "getImage":"/getImage",
  "deleteInvoice":"/deleteInvoice",
}
 


export const distributer = (data,apiName) => {
  console.log(pythonUrl+api[apiName])
  return function action(dispatch) {
    return Axios.post(pythonUrl+api[apiName],data).then(res => {
      let response = res['data']
      return response
    }).catch(err => {
      return catchError(dispatch,err)
    })
  }
};

export const dataStoreSetter = (data,type) => {
  return function action(dispatch) {
      return dispatch({
        type: types[type],
        payload: data
      })
  }
};

function catchError(dispatch, error) {
  if (error.response) {
    let message = error.response.data
    console.log(error.response, error.response.status);
    error.response.status = error.response.data && error.response.data === "Unauthorized" ? 400 : error.response.status
    return dispatch({ type: types.CATCH_ERROR, payload: { status: error.response.status, message } })
  } else if (error.request) {
    return dispatch({ type: types.CATCH_ERROR, payload: { status: 201, message: error.request } })
  } else {
    console.log('Error', error.message);
    return dispatch({ type: types.CATCH_ERROR, payload: { status: 201, message: error.message } })
  }
}
