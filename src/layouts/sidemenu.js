import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import '../styles/sidemenu.css'

 class sidemenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tab:"",
        }
    }
    componentDidMount(){
     
    }

    TabChange=(tab)=>{
        this.setState({tab:tab},()=>{
            this.props.history.push(tab)
        })
    }
    

    render() {
        let {tab}={...this.state}
        return (
            <div className="side-menu ">
                <div className='menu-icon '> <i className="fas fa-angle-right fa-lg "></i></div>
                <div className="sidemenu-body ">
                <div className="mb-3 mt-4 sideContent " onClick={e => { this.TabChange("/dashboard")}} >
                        < i className =  {"fas  fa-line-chart mr-1"+(tab==="/"?" text-warning":"")}  ></i>
                        <span className="ml-3  "> Dashboard</span>
                </div>
                <div className="mb-3 mt-4 sideContent " onClick={e => { this.TabChange("/share")}} >
                        < i className =  {"fas  fa-share-square mr-1"+(tab==="/"?" text-warning":"")}  ></i>
                        <span className="ml-3  "> Shared Invoice</span>
                </div>
                <div className="mb-3 mt-4 sideContent " onClick={e => { this.TabChange("/user")}} >
                        < i className =  {"fas  fa-users  mr-1"+(tab==="/"?" text-warning":"")}  ></i>
                        <span className="ml-3  "> People</span>
                </div>
              
            </div>
               
            </div >
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(sidemenu));