import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/thada.css'
import {
    FormGroup,
    Label,
   Input,Modal,ModalBody,ModalFooter, CardHeader, CardBody,Card
  } from "reactstrap";
import _ from 'lodash';
import ThadaView from './thadaView.js';
import * as basic from "../../store/actions/basic.action.js";
import moment from "moment";
class ThadaEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            unitList:[],
            materialList:{
                "wc1":"White Cutting 1",
                "wckn":"Kolkata First Nmol",
                "wc2":"White Cutting 2",
                "wg1":"White Gada 1",
                "wg2":"White Gada 2",
                "wol":"White Overloc",
                "wprint":"White Print",
                "spb1":"Bleach 1",
                "tspb":"Tinobal",
                "mol":"Meco Overloc",
                "mprint":"Meco Print",
                "wgn1":"White GadaNice 1",
                "spb2":"Bleach 2",
                "wmil/ol":"White Milange Overloc",
                "mmil/ol":"Meco Milange Overloc",
                "my":"Meco Yarn",
                "mmil":"Meco Milange",
                "mc1":"Meco Cutting 1",
                "mc2":"Meco Cutting 2",
                "mg1":"Meco Gada 1",
                "mg2":"Meco Gada 2",
                "wck":"Kolkata First",
                "mps":"Meco Print Special",
                "wps":"White Print Special",
                "whitner":"Whitner",
                "wcr":"White Rising",
                "mcr":"Meco Rising",
                "wtc":"White TeriCotton",
                "mtc":"Meco TeriCotton",
                "lwc1":"Loose Cotton 1",
                "lwc2":"Loose Cotton 2",
                "ssb":"Special",
                "wpoly":"White PolyCotton",
                "mpoly":"Meco PloyCotton",
                "wcblue":"WC (Blue)",
                "wpol":"White Print Overloc",
                "mpol":"Meco Print Overloc",
                "milprint":"Milange Print",
                "wmils":"White Milange Special",
                "mmils":"Meco Milange Special",
                "wckA":"wck Agarwal",
                "wcs":"WC Special",
                "wcA":"WC Agarwal",
                "spbs":"Bleach Special"


            },
            rateList:{
                "wc1":66,
                "wckn":64,
                "wc2":56,
                "wg1":52,
                "wg2":16,
                "wol":47,
                "wprint":38,
                "spb1":42,
                "tspb":46,
                "mol":40,
                "mprint":36,
                "wgn1":31,
                "spb2":30,
                "wmil/ol":25,
                "mmil/ol":0,
                "my":37,
                "mmil":36,
                "mc1":55,
                "mc2":46,
                "mg1":40,
                "mg2":30,
                "wck":63,
                "mps":40,
                "wps":42,
                "whitner":45,
                "wcr":58,
                "mcr":51,
                "wtc":59,
                "mtc":49,
                "lwc1":0,
                "lwc2":52,
                "ssb":30,
                "wpoly":46,
                "mpoly":30,
                "wcblue":61,
                "wpol":0,
                "mpol":0,
                "milprint":28,
                "mmils":0,
                "wmils":39,
                "wckA":68,
                "wcs":66,
                "wcA":68,
                "spbs":0,

            },
            partyList:["vinayaka_tex","vinayaka_mills","jeyam_mills","kavitha_tex","first_quality","varsidhi","adithya"],
            combinationList:{
                "vinayaka_tex":["wc2","wol","wg1","wpol","mc2","wg2","wgn1","spb1","spb2","tspb","mmil","mprint","milprint","mol","mpol","my"],
                "vinayaka_mills":["wc1","wc2","wck","wol","wg2","wg1","mc1","mc2","wmils","wps","whitner","spb1","mg1","mps"],
                "jeyam_mills":["wc1","wc2","wck","wckA","wol","mc1","mc2","wpoly","mpoly","wcs"],
                "kavitha_tex":["wcs","wc1","wc2","wcA","wck","wol","wg2","mc1","mc2","mg1","my","whitner","spb1"],
                "first_quality":["wc1","wc2","wck","wckn","wcA","wol","mc1","mc2","wg1"],
                "varsidhi":["wcA","wcs","wc1","wc2","wck","wckn","wol","wg1","mc1","mc2"],
                "adithya":["wcA","wc2","wck","wckn","wol","wg2","wps","mc1","mg1","my","whitner","spb1","wgn1","wnada"],

            },
            currentPartyCombination:[],
            thadaList:{},
            formdata:{},
            selectedUnit:"first_machine",
            selectedThada:"vinayaka_tex",
            viewMode:false,
            filterName:"",
            selectedDate:moment().format("YYYY-MM-DD"),
            clearEverything:false,
            copyMode:false,
            copydata:{},
        }
    }
    
    componentDidMount(){
        if(this.props.material_list.length<=0){
            this.getMaterialList()
        }else{
            this.dataFeeder(this.props.material_list)  
        }
       let {unitList,selectedUnit,selectedThada}={...this.state}
       selectedUnit="first_machine"
       selectedThada="vinayaka_tex"
       this.setState({unitList:unitList,selectedUnit,selectedThada})
    }
    componentDidUpdate(){
        let {unitList,thadaList}={...this.state}
        if(unitList!==this.props.unitList){
            let units=this.props.unitList
            units.forEach((unit)=>
            thadaList[unit]={}
            )
            this.setState({unitList:units,thadaList:thadaList })
        }
    }
    getMaterialList=()=>{
        this.props.distributer({},"materialList").then(response => {
            if(response['status']===200){
                this.props.dataStoreSetter(response['data'],"MATERIAL_LIST")         
                this.dataFeeder(response['data'])          
            }else{ 
              this.toasterHandler("error", response['msg'] || "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
    }

    dataFeeder=(material)=>{
        let materialObj={}
        let rateObj={}  
        material && material.forEach((item,val)=>{
            materialObj[item['symbol']]=item['name']
            rateObj[item['symbol']]=item['rate']
        })
        this.setState({materialList:materialObj,rateList:rateObj})
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
    
    handleChange=(e)=>{
        let { formdata } = { ...this.state }
        formdata[e.target.name] = e.target.value       
        this.setState({ formdata })
    }

    addThada=()=>{
        let { selectedThada,selectedDate,selectedUnit,combinationList,thadaList,rateList } = { ...this.state }
        let party=this.getParty(selectedThada)     
        let material=combinationList[party]
        let rate=[]
        let weight=[]
        let tr=[]
        material.forEach((val,ind)=>{
            rate.push(rateList[val])
            weight.push(0)
            tr.push(0)
        })
        let count=Object.keys(thadaList[this.getParty(selectedUnit)])

        thadaList[this.getParty(selectedUnit)][String(Number(_.last(count))+1 || 0)]={
            name:party,
            date:selectedDate,
            material:material,
            weight:weight,
            rate:rate,
            totalRate:tr,
            weightCumulative:0,
            rateCumulative:0,
            
        }   
        console.log(thadaList)
        this.setState({thadaList:thadaList })
    }

    handleWeightChange=(unit,thada,material,index,e)=>{
        let {thadaList}={...this.state}
        thadaList[unit][thada]["weight"][index]=Number(parseFloat((e.target.value)))
        thadaList=this.calculateCumulative(thadaList,unit,thada,index)
        this.setState({thadaList})
    }
    handleRateChange=(unit,thada,material,index,e)=>{
        let {thadaList}={...this.state}
        thadaList[unit][thada]["rate"][index]=Number(parseFloat(Number(e.target.value)))
        thadaList=this.calculateCumulative(thadaList,unit,thada,index)
        this.setState({thadaList})
    }
    calculateCumulative=(thadaList,unit,thada,index)=>{
        thadaList[unit][thada]["totalRate"][index]=(thadaList[unit][thada]["weight"][index]*thadaList[unit][thada]["rate"][index]).toFixed(2)
        thadaList = this.calculateTotalCumulative(thadaList,unit,thada)
        return thadaList
    }

    calculateTotalCumulative=(thadaList,unit,thada)=>{
        let wc=0
        let rc=0
        thadaList[unit][thada]["material"].forEach((val,ind)=>{
            wc=wc+parseFloat(thadaList[unit][thada]["weight"][ind])
            rc=rc+parseFloat(thadaList[unit][thada]["totalRate"][ind])
        })
        thadaList[unit][thada]["weightCumulative"]=wc.toFixed(2)
        thadaList[unit][thada]["rateCumulative"]=rc.toFixed(2)
        return thadaList
    }

    
    handleModal=(unit,thada)=>{
        let {thadaList,materialList}={...this.state}
        let cm=thadaList[unit][thada]["material"].slice()
        let am=Object.keys(materialList)
        let all=_.difference(am, cm)
        let obj={
            unit:unit,
            thada:thada,
            currentMaterial: cm,
            allMaterial:all,
            date:thadaList[unit][thada]["date"],
            name:thadaList[unit][thada]["name"],
        }
       
        this.setState({modalData:obj,materialFilter:obj['allMaterial'].slice(),modal:true})
    }

    editMaterial=(item,index,operation)=>{
        let {modalData,materialFilter,filterName}={...this.state}
        let cm=modalData["currentMaterial"].slice()
        let am=modalData["allMaterial"].slice()
        if(operation==="add"){
            cm.push(item)
            let ind=am.indexOf(item)
            ind>-1 && am.splice(ind,1)
        }else  if(operation==="remove"){
            am.push(item)
            let ind=cm.indexOf(item)
            ind>-1 && cm.splice(ind,1)
        }
        modalData["currentMaterial"]=cm
        modalData["allMaterial"]=am
        materialFilter = am
        filterName=""
        this.setState({modalData,materialFilter,filterName})
    }
    saveThada=()=>{
        let {thadaList,modalData,rateList,clearEverything}={...this.state}
        let unit=modalData["unit"]
        let thada=modalData["thada"]
        console.log(thadaList,unit,thada)
        let existing=thadaList[unit][thada]["material"].slice()
        let material=[]
        let rate=[]
        let weight=[]
        let totalRate=[]
        if(clearEverything){
            modalData["currentMaterial"].forEach((element) => {
                material.push(element)
                rate.push(rateList[element])
                weight.push(0)
                totalRate.push(0)
            });
        }
        else{
        existing.forEach((element,index) => {
            let ind=modalData["currentMaterial"].indexOf(element)
            if(ind!==-1){
                material.push(element)
                rate.push(rateList[element])
                weight.push(thadaList[unit][thada]["weight"][index])
                totalRate.push(thadaList[unit][thada]["totalRate"][index])
                modalData["currentMaterial"].splice(ind,1)
            }
        });
        modalData["currentMaterial"].forEach((element,index) => {
                material.push(element)
                rate.push(rateList[element])
                weight.push(0)
                totalRate.push(0)
        });
         }
         thadaList[unit][thada]["date"]=modalData['date']
        thadaList[unit][thada]["name"]=modalData['name']
        thadaList[unit][thada]["material"]=material
        thadaList[unit][thada]["weight"]=weight
        thadaList[unit][thada]["rate"]=rate
        thadaList[unit][thada]["totalRate"]=totalRate
        thadaList = this.calculateTotalCumulative(thadaList,unit,thada)
        this.setState({thadaList,modal:false,modalData:"",clearEverything:false})
    }
    switchViewMode=()=>{
            let {viewMode,thadaList,selectedThada,selectedUnit}={...this.state}
            let finalWeight={}
            if(!viewMode){
                Object.keys(thadaList).forEach((thada,index)=>{
                    let cumulativeThadaWeight=0
                    let cumulativeThadaRate=0
                    Object.keys(thadaList[thada]).forEach((items,ind)=>{
                        cumulativeThadaWeight = cumulativeThadaWeight +  parseFloat(thadaList[thada][items]["weightCumulative"])
                        cumulativeThadaRate = cumulativeThadaRate +      parseFloat(thadaList[thada][items]["rateCumulative"])
                    })
                    let obj={
                        unitThadaWeight:cumulativeThadaWeight,
                        unitThadaCost:cumulativeThadaRate
                    }
                    finalWeight[thada]=obj
                })
             }else{
                selectedUnit="first_machine"
                selectedThada="vinayaka_tex"
             }
            this.setState({viewMode:!viewMode,totalThada:finalWeight,selectedUnit,selectedThada})
    }
    handleFilterChange=(val)=>{
        let {modalData,materialFilter,filterName,materialList}={...this.state}
        filterName=val || ""
        if(filterName){
             materialFilter = modalData['allMaterial'].filter(word => (word.toLowerCase().includes(filterName.toLocaleLowerCase()) || materialList[word].toLowerCase().includes(filterName.toLocaleLowerCase())));
        }else{
            materialFilter = modalData['allMaterial']
        }
        this.setState({materialFilter,filterName})
    }
    deleteThada=(unit,thada)=>{
        let {thadaList}={...this.state}
        delete thadaList[unit][thada]
        this.setState({thadaList})
    }
    handleCopy=(unit,thada)=>{
        let {thadaList,copydata}={...this.state}
        Object.assign(copydata, thadaList[unit][thada]);
        this.setState({copydata,copyMode:true,modal:true})
    }
    handleCopyTo=(unit)=>{
        let {thadaList,copydata}={...this.state}
        let count=Object.keys(thadaList[this.getParty(unit)])
        thadaList[this.getParty(unit)][String(Number(_.last(count))+1 || 0)]=JSON.parse(JSON.stringify(copydata)); 
        this.setState({copyMode:false,thadaList,copydata:{},modal:false})
    }
    upload=()=>{
        let {thadaList}={...this.state}
        let fd=new FormData()
        fd.append('paramThada',thadaList)
        this.props.distributer(thadaList,"uploadThada").then(response => {
            if(response['status']===200){
                this.toasterHandler("success",response['data'])
                let units=this.props.unitList
                units.forEach((unit)=>
                    thadaList[unit]={}
                )
                this.setState({thadaList})
                this.props.updateThadaList()
            }else{ 
              this.toasterHandler("error", "Cant reach the server")
            }
          }).catch((err)=>{
            this.toasterHandler("error", "Cant reach the server")
          })
        
    }

    clearThada=()=>{
        let {clearEverything,modalData,materialList}={...this.state}
        let obj={}
        //allMaterial:modalData['currentMaterial'].concat(modalData['allMaterial']),

        if(!clearEverything){
            obj={
                unit:modalData['unit'],
                thada:modalData['thada'],
                currentMaterial:[],
                allMaterial:Object.keys(materialList),
                date:modalData['date'],
                name:modalData['name'],
            }
             this.setState({modalData:obj,materialFilter:obj['allMaterial'].slice()})

        }else{
            this.handleModal(modalData['unit'],modalData['thada'])
        }
        this.setState({clearEverything:!clearEverything})

    }

    handleModalChangeData=(e)=>{
        let {modalData}={...this.state}
        modalData[e.target.name]=e.target.value
        this.setState({modalData})
    }

    toLocale=(val)=>{
        return parseFloat(val).toLocaleString('en-IN')
    }

    render() {
        let {partyList,unitList,materialList,thadaList,modalData,modal,viewMode,totalThada,materialFilter,filterName,selectedDate,clearEverything,copyMode}={...this.state}
        return (
            <div className="flex pl-1 pr-1">
                <div className="thada-viewMode row">
                {viewMode &&
                    <div className="col-5">
                    <button className={"btn btn-lg font-weight-bold  btn-dark"} onClick={e=>this.upload()}><i className="fa fal-lg fa-upload" aria-hidden="true"></i> Upload</button>
                    </div>

                }
                <div className="col-5 ">
                <button className={"btn btn-lg  font-weight-bold "+ (viewMode?" btn-primary":"  btn-danger")} onClick={e=>this.switchViewMode()}>View Mode:{(viewMode?" ON":" OFF")}</button>
                </div>
                </div>
            {!viewMode
                ?
                <Card>    
                <CardHeader className="m-1 text-light bg-primary row">
                <FormGroup className="col-lg-3">
                    <Label for="unit" className="text-light font-weight-bold h5">Unit</Label>
                    <Input type="select" name="party" id="unit" onChange={e=>this.setState({selectedUnit:e.target.value})}>
                        {unitList.map((unit,ind)=>
                        <option key={ind}>{this.getName(unit)}</option>
                        )}
                    </Input>
                </FormGroup>
                <FormGroup className="col-lg-3">
                    <Label for="thadaParty" className="text-light font-weight-bold h5">Thada</Label>
                    <Input type="select" name="party" id="thadaParty" onChange={e=>this.setState({selectedThada:e.target.value})}>
                        {partyList.map((party,ind)=>
                        <option key={ind}>{this.getName(party)}</option>
                        )}
                    </Input>
                </FormGroup>
                <FormGroup className="col-lg-3">
                    <Label for="date" className="text-light font-weight-bold h5">Date</Label>
                    <Input type="date" name="date" id="date" value={selectedDate} onChange={e=>this.setState({selectedDate:e.target.value})}>
                    </Input>
                </FormGroup>
                <div className="col-lg-2 d-flex justify-content-center p-4">
                <button className="btn btn-dark font-weight-bold" onClick={e=>this.addThada()}>Create</button>
                </div>
                </CardHeader>
                <hr></hr>
                  <CardBody className=" mt-2 m-1 p-3">
                            {thadaList && Object.keys(thadaList).map((unit,index)=>
                              
                              !_.isEmpty(thadaList[unit]) && <Card key={index}>
                                <CardHeader className="text-light h5 mb-3 bg-info">{this.getName(unit)}
                                       
                                </CardHeader>
                                {Object.keys(thadaList[unit]).map((thada,key)=>
                                 <div key={key}>
                                    <div className="flex row mb-2">
                                        <span className="text-info font-weight-bold ml-3 h4  col-6">{this.getName(thadaList[unit][thada]["name"])}<span className="ml-3 text-secondary"> {"["+thadaList[unit][thada]["date"]+"]"}</span></span>
    
                                        <span className="col-3">
                                        <button className="btn btn-danger mr-2" onClick={e=>this.deleteThada(unit,thada)}><i className="fa fa-lg fa-trash" aria-hidden="true"></i></button>
                                        <button className="btn btn-success " onClick={e=>this.handleModal(unit,thada)}> <i className="fa fa-lg fa-pencil mr-2" aria-hidden="true"></i>Edit</button>
                                        <button className="btn btn-primary ml-2 " onClick={e=>this.handleCopy(unit,thada)}> <i className="fa fa-lg fa-copy mr-2" aria-hidden="true"></i>Copy</button>
                                        </span>
                                    </div>
                                    {thadaList[unit][thada]["material"] && thadaList[unit][thada]["material"].map((val,ind)=>

                                    <div key={ind} className="flex row m-1">
                                        <div className="col-lg-3">{(ind+1)+") "+materialList[thadaList[unit][thada]["material"][ind]]+" ("+thadaList[unit][thada]["material"][ind]+")"}    <span className="font-weight-bold">{"["+((thadaList[unit][thada]["weight"][ind]/thadaList[unit][thada]["weightCumulative"])*100).toFixed(2) +"% ]"}</span></div>
                                        <div className="col-lg-2"><Input placeholder="Weight"  type="number" name={unit+"_"+thada+"_"+val} value={thadaList[unit][thada]["weight"][ind]} onChange={e=>this.handleWeightChange(unit,thada,thadaList[unit][thada]["material"][ind],ind,e)} /></div>
                                        <div className="col-lg-1">{" * "}</div>
                                        <div className="col-lg-2"><Input placeholder="rate"  type="number" value={thadaList[unit][thada]["rate"][ind]} onChange={e=>this.handleRateChange(unit,thada,thadaList[unit][thada]["material"][ind],ind,e)}/></div>
                                        <div className="col-lg-1">{" = "}</div>
                                        <div className="col-lg-2"><Input placeholder="total"  type="number" value={thadaList[unit][thada]["totalRate"][ind]} disabled/></div>
                                    </div>
                                    
                                    )}
                                    <div className="row flex m-1 ">
                                    
                                        <div className="col-lg-3 text-danger font-weight-bold">Weight Cumulative</div>
                                        <div className="col-lg-2"><Input type="text" value={this.toLocale(thadaList[unit][thada]["weightCumulative"])} className="border-warning"disabled/></div>
                                        <div className="col-lg-1 text-danger font-weight-bold p-1">Average</div>
                                        <div className="col-lg-2"><Input type="text" value={this.toLocale(thadaList[unit][thada]["rateCumulative"]/thadaList[unit][thada]["weightCumulative"])} className="border-warning" disabled/></div>
                                        <div className="col-lg-1 text-danger font-weight-bold">Rate Cumulative</div>
                                        <div className="col-lg-2"><Input type="text" value={this.toLocale(thadaList[unit][thada]["rateCumulative"])} className="border-warning" disabled/></div>
                                    </div>
                                    <hr></hr>
                                </div>
                                
                                )}       
                                </Card>                     
                            )}
                  </CardBody>

                  <Modal className="modal-width" isOpen={modal} size="lg" >
                    <div className="flex m-2 row p-1">
                    <span className="col-10 h4 font-weight-bold text-primary">{copyMode ? "Copy":"Edit"}</span>
                    </div>
                    <ModalBody>
                          {!copyMode?
                          
                                <div className="flex row">
                                    <div className="row col-lg-12 d-flex justify-content-center">
                                            <div className="col-lg-5">
                                                <Input type="text" value={modalData && modalData['name']} name="name" onChange={e=>this.handleModalChangeData(e)}></Input>
                                            </div>
                                            <div className="col-lg-5">
                                                <Input type="date" name="date" id="date" value={modalData && modalData['date']} onChange={e=>this.handleModalChangeData(e)}/>
                                            </div>
                                            
                                    </div>                             
                                    <div className="col-lg-6 modal-scroll">
                                    <hr></hr>
                                        <div className="flex  row">
                                            <span className="h5 font-weight-bold text-info col-lg-6">Included</span>
                                            <span className="col-lg-4 ml-5  font-weight-bold"><button  className={"btn btn-sm"+(clearEverything?" btn-warning":" btn-danger")}onClick={e=>this.clearThada()} >{clearEverything?" Undo":" Clear"}</button></span>
                                        </div>
                                        <hr></hr>
                                        <ol>
                                        {modalData && modalData["currentMaterial"].map((item,ind)=>
                                                <li key={ind} className="m-1"><button className="btn incModalBtn" onClick={e=>this.editMaterial(item,ind,"remove")}>{item +" ("+materialList[item]+") "}</button></li>
                                        )}
                                        </ol>
                                    </div>
                                    <div className="col-lg-6 modal-scroll">
                                    <hr></hr>
                                        <div className="flex row ">
                                            <span className="h5 font-weight-bold text-info col-lg-6">Excluded</span>
                                            <span className="col-lg-6"><Input placeholder="Search..."  type="text" name="filter" value={filterName} onChange={e=>this.handleFilterChange(e.target.value)} /></span>
                                        </div>
                                        <hr></hr>
                                        <ol>
                                        {modalData && modalData["allMaterial"] && materialFilter.map((item,ind)=>
                                                <li key={ind} className="m-1"><button className="btn excModalBtn" onClick={e=>this.editMaterial(item,ind,"add")}>{item +" ("+materialList[item]+") "}</button></li>
                                        )}
                                        </ol>
                                    </div>
                          </div>
                          :
                          <div className=" text-center flex row">
                                <span className="text-danger m-2 ml-4">Please Select the Unit:</span>
                                {unitList && unitList.map((unit,key)=>
                                <div className="col-lg-12 d-flex justify-content-center row">
                                <Card  key={key} className="col-lg-4 m-1 p-2 font-weight-bold col-lg-4 text-light c-pointer incModalBtn" onClick={e=>this.handleCopyTo(unit)}>
                                    {this.getName(unit)}
                                </Card>
                                </div>
                                )}

                          </div>
                          }
                    </ModalBody>
                    <ModalFooter>
                    {!copyMode && <button className="btn btn-success" onClick={e=> (this.saveThada())}>Save</button>}{' '}
                    <button className="btn btn-danger" onClick={e=>this.setState({modalData:"",modal:false,clearEverything:false,copyMode:false})}>Cancel</button>
                    </ModalFooter>
                 </Modal>
            </Card>

            :
                    <ThadaView  thadaList={thadaList} totalThada={totalThada}/>
            }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        material_list: state.Reducer.material_list

    };
}

function mapDispatchToProps(dispatch) {
    return {
        distributer: (data,api) => { return dispatch(basic.distributer(data,api)); },
        dataStoreSetter: (data,type) => { return dispatch(basic.dataStoreSetter(data,type)); },
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ThadaEntry));