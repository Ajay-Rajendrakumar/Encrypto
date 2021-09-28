import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/thada.css'
import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,

  } from "reactstrap";



class Thadaview extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    
    componentDidMount(){
        
     
    }
    getName=(party)=>{
        party=party.replace(/_/g, " ");
        return party.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    getParty=(party)=>{
        return party.toLowerCase().replace(/ /g, "_");
  
    }
    toasterHandler = (type, msg) => {
        toast[type](msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    
    toLocale=(val)=>{
        return parseFloat(val).toLocaleString('en-IN')
    }

    render() {
        let {thadaList,totalThada}={...this.props}
        return (

            <div className="flex m-2">
                {thadaList && totalThada && 
                    Object.keys(thadaList).map((unit,index)=>
                        <div key={index} className="flex">
                            <span className="text-success font-weight-bold h4">{this.getName(unit)}</span>
                            <hr></hr>
                            <div className="row text-center">
                            {Object.keys(thadaList[unit]).map((thada,key)=>
                                <Card className="col-lg-5" key={key}>
                                    <CardHeader className="text-primary font-weight-bold h5">{this.getName(thadaList[unit][thada]['name'])+" ["+thadaList[unit][thada]['date']+"]"}</CardHeader>
                                    <CardBody>
                                        <table class="table  text-light">
                                        <thead>
                                            <tr>
                                            <th scope="col">Sno</th>
                                            <th scope="col">Material</th>
                                            <th scope="col">Percent</th>
                                            <th scope="col">Weight</th>
                                            <th scope="col">Rate</th>
                                            <th scope="col">Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(thadaList[unit][thada]["material"]).map((item,ind)=>
                                             <tr>
                                             <th scope="row">{ind+1}</th>
                                             <td>{thadaList[unit][thada]["material"][ind]}</td>
                                             <td>{((thadaList[unit][thada]["weight"][ind]/thadaList[unit][thada]["weightCumulative"])*100).toFixed(2) +"%"}</td>
                                             <td>{this.toLocale(thadaList[unit][thada]["weight"][ind])}</td>
                                             <td>{thadaList[unit][thada]["rate"][ind]}</td>
                                             <td>{this.toLocale(thadaList[unit][thada]["totalRate"][ind])}</td>
                                           </tr>
                                            )}
                                        </tbody>
                                        </table>
                                    </CardBody>
                                    <CardFooter className="flex row">
                                             <span className="col-lg-3 text-info font-weight-bold h5">Total Weight</span>
                                             <span className="col-lg-3 text-info font-weight-bold h5">{this.toLocale(thadaList[unit][thada]["weightCumulative"])}</span>
                                             <span className="col-lg-3 text-info font-weight-bold h5">Rate</span>
                                            <span className="col-lg-3 text-info font-weight-bold h5">{this.toLocale(thadaList[unit][thada]["rateCumulative"])}</span>
                                    </CardFooter>
                                </Card>
                            )}
                            <hr></hr>
                                <div className="flex m-3 row col-lg-12 bg-info text-light h5 p-2 m-3">
                                    <span className="col-lg-3  p-1">Total Unit Thada Weight</span>
                                    <span className="col-lg-3  p-1">{this.toLocale(totalThada[unit]["unitThadaWeight"])}</span>
                                    <span className="col-lg-3  p-1">Total Unit Thada Cost</span>
                                     <span className="col-lg-3  p-1">{this.toLocale(totalThada[unit]["unitThadaCost"])}</span>
                                 </div>
                            </div>
                            <hr></hr>
                        </div>
                 )}
            </div>
         
        );
    }
}

function mapStateToProps(state) {
    return {

    };
}

function mapDispatchToProps(dispatch) {
    return {
        
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Thadaview));