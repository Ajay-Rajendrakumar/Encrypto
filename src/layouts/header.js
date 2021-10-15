    import React, { Component } from 'react';
    import { withRouter } from 'react-router-dom';
    import { connect } from 'react-redux';
    import '../styles/header.css'
    import * as basic from "../store/actions/basic.action.js";
    import moment from 'moment';
    
    class header extends Component {
        constructor(props) {
            super(props);
            this.state = {    
                month_list:{
                    "January":"01",
                    "February":"02",
                    "March":"03",
                    "April":"04",
                    "May":"05",
                    "June":"06",
                    "July":"07",
                    "August":"08",
                    "September":"09",
                    "October":"10",
                    "November":"11",
                    "December":"12",
                }
            }
        }
        componentDidMount(){
    
            
        }


        fetchMonth=(month)=>{
            let {month_list}={...this.state}
            let dateFormat=moment().format("YYYY-MM-DD").slice(0, -5) +String(month_list[month])
            let data={
                "start_date":dateFormat+'-01',
                "end_date":dateFormat+'-31',
                "month":month,
            }
            let currentMonth=moment().format("MMMM")
            if(month===currentMonth){
                data['end_date']=moment().format("YYYY-MM-DD")
            }
            this.props.dataStoreSetter(data,"FETCH_MONTH")
        }
        render() {
            return (
                <div>
                    <header className="header">
                        <div className="row  d-flex justify-content-between">
                        <div className="name-profileImage ">BE </div>
                        <div className=" name m-4 h4 text-info">Encrypto</div>
                            <span className="text-light h5 m-4 mr-5">
                                <i className="fa fa-user mr-2"></i>{ this.props.user_data && this.props.user_data['user']['name']}
                                <button className="ml-2 text-danger btn btn-sm c-pointer" onClick={e=>(window.confirm("Are you sure?") && this.props.history.push('/'))}>
                                    Logout
                            </button>
                            </span>
                          
                        </div>
                    </header>
                </div>
            );
        }
    }

    function mapStateToProps(state) {
        return {
            user_data:state.Reducer.user_data
        };
    }

    function mapDispatchToProps(dispatch) {
        return {
            dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },
        };
    }
    export default withRouter(connect(mapStateToProps, mapDispatchToProps)(header));