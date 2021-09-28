import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import _ from 'lodash';
import * as basic from "../../store/actions/basic.action.js";
import Material from "./material_stock.js"
import Transfer from "./transfer_stock.js"

class Stock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab:"stock"
        }
    }
    
    componentDidMount(){
 
    }
    handleTabChange=(tab)=>{
        let {currentTab}={...this.state}
        currentTab=tab
        this.setState({currentTab})

    }
    
 
    render() {
        let {currentTab}={...this.state}
        return (
            <div className="flex d-flex justify-content-center">
            <div className="flex col-12">
                <hr></hr>
                <div className="d-flex row justify-content-center">
                    <button className={"btn btn-lg  col-2 m-1 font-weight-bold "+(currentTab!=="stock" ?"btn-secondary": "btn-success")} onClick={e=>this.handleTabChange("stock")}>Material Stock</button>
                    <button className={"btn btn-lg  col-2 m-1 font-weight-bold "+(currentTab!=="transfer" ?"btn-secondary": "btn-success")} onClick={e=>this.handleTabChange("transfer")}>Transfer Stock</button>
                </div >
                <hr></hr>
                <div className="mt-5">
                {currentTab==="stock"?
                       <Material></Material>
                :
                         <Transfer></Transfer>
       }
           </div>
   </div> 
   </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        sales_party: state.Reducer.sales_party,

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },

    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Stock));