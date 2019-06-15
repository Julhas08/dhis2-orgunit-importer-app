import React from 'react';
import Papa from 'papaparse';
import Card from 'material-ui/Card/Card';
import CardText from 'material-ui/Card/CardText';
import { withStyles } from '@material-ui/core/styles';
import {Button} from '@dhis2/d2-ui-core';
import {InputField} from '@dhis2/d2-ui-core';
import axios from 'axios';
import swal from 'sweetalert';
import LinearProgress from '../components/UI/LinearProgress';

// import CloudUploadIcon from '@material-ui/icons/CloudUpload';
const baseURL = 'http://199.188.207.78:8080/';
// const baseURL = '../../../';

const styles = {
  card: {
    margin: 16,
    width: 550,
    minHeight: 300,
    float: 'left',
    transition: 'all 175ms ease-out',
  },
  cardText: {
    paddingTop: 0,
  },
  cardHeader: {
    padding: '0 16px 16px',
    margin: '16px -16px',
    borderBottom: '1px solid #eeeeee',
  },
  textField:{
    margin: 16,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonPosition: {
    marginTop: '37px',
  },
  settingIcon: {
    float: 'right',
    pointer: 'cursor',
  }
};

styles.cardWide = Object.assign({}, styles.card, {
  width: (styles.card.width * 3) + (styles.card.margin * 4),
});

class WHONETFileReader extends React.Component {
    constructor(props) {
        super(props);
        const d2        = props.d2;
        this.state = {
            csvfile     : undefined,
            orgUnitField: '',
            d2          : d2,
            orgUnits    : '',        
            loading     : false,
            error       : false,
            userOrgUnitName: props.orgUnit,
            eventsResponse : '',
            fileFormatValue: '',
            isModalOpen: false,
            userRoles  : "",
            userAuthority : "",
        };
        this.updateData = this.updateData.bind(this);
        
            
    }
    componentWillMount(){
        // Current user roles and organization unit    
        let symbolValueCurrentUser = Object.getOwnPropertySymbols(this.props.d2.currentUser);
        let userRoles              = this.props.d2.currentUser[symbolValueCurrentUser[0]];
        //let userOrgUnitId          = this.props.d2.currentUser[symbolValueCurrentUser[1]];
        // User authorities checking
        let symbolValueUserAuthorities = Object.getOwnPropertySymbols(this.props.d2.currentUser.authorities);
        let userAuthorities            = this.props.d2.currentUser.authorities[symbolValueUserAuthorities[0]]
        let userAuthoritiesValues      = userAuthorities.values();        
        for (var authority = userAuthoritiesValues.next().value; authority = userAuthoritiesValues.next().value;) {
            if(authority === "ALL"){
                this.setState({
                    userRoles: userRoles[0],
                    userAuthority: authority,
                });
            }
        } 

         
    }
    handleChangeFileUpload = event => {

        // file format checking
        let filename     = event.target.files[0].name;
        let splittedName = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
        if (splittedName !== 'csv') {
            swal("Sorry! Please upload correct file format! Accepted file fortmat is CSV. Your selected file name: "+event.target.files[0].name + " Last Modified: "+ event.target.files[0].lastModified + " Size: "+ event.target.files[0].size + " File type: "+ event.target.files[0].type, {
                icon: "warning",
            });
        }
        this.setState({
          csvfile: event.target.files[0],
          fileFormatValue: splittedName
        });
        console.log("Your selected file: ", event.target.files[0].name);
    };

    importCSVFile = (e) => {

        const { csvfile } = this.state;
        Papa.parse(csvfile, {
          complete: this.updateData,
          header  : true
        });
        // Close the pre-alert dialog box
        this.setState({
            loading: true,
        });
    };

    updateData(result) {
        let data                 = result.data;    
        let orgUnitId = document.getElementById('selectedOrgUnitId').value;
        let userOrgUnitName, pid, orgUnits,j=0;
         //Org unit delete
        /*orgUnits = ["gQWi4jLyx9i","eca4ijm4Sy2"];
        for (var i = 0; i < orgUnits.length; i++) {
          
          axios(baseURL+'api/organisationUnits/'+orgUnits[i], {
            method: 'DELETE',
            headers: {
            'content-type': 'application/json',
            Authorization: "Basic " + btoa("julhas:Tucana@2020")   
            },
            data: orgUnits,
          })
          .then(response => {
              console.log("Response: ", response.data);
              
          })
          .catch(error => {
              throw error;
          }); 
        }*/
        
        for (var i = 0; i < data.length-1; i++) {
          
          Object.entries(data[i]).map(([key,value]) => {
            if(key === "PUID"){
              pid = value;
            }else if(key === "ORG"){
              userOrgUnitName = value;
            }             
            return null;
          });
          orgUnits = '{ "level": 4, "name": "'+userOrgUnitName+'","shortName": "'+userOrgUnitName+'","displayName": "'+userOrgUnitName+'","openingDate": "2016-01-01","parent": {"id":"'+pid+'"} }';
            console.log("orgUnits: ", orgUnits);
          axios(baseURL+'api/organisationUnits', {
                method: 'POST',
                headers: {
                'content-type': 'application/json',
                Authorization: "Basic " + btoa("julhas:Tucana@2020")   
                },
                data: orgUnits,
            })
            .then(response => {
                this.setState({ orgUnits : response.data.status})
                console.log("Response: ", response.data);
                if(i === j){
                  if(this.state.orgUnits === "OK" ){
                      swal("Successfully uploaded org unit!", {
                          icon: "success",
                      });
                      this.setState({
                          loading: false
                      });
                  }
                }
                
            })
            .catch(error => {
                throw error;
            });  
        }      
  
        
    }
    onChangeValue = (field, value) => {
        this.setState({ [field]: value });
    };

    uploadAlertShow=(e)=> {
        let orgUnitId = document.getElementById('selectedOrgUnitId').value;
        if(typeof orgUnitId === 'undefined' || orgUnitId === null || orgUnitId === ''){
            swal({
                title: "Sorry! Please select organisation unit first!",
                icon: "warning",
            });
        } else if(typeof this.state.csvfile === 'undefined'){
            swal({
                title: "Sorry! You forgot to select your file!",
                icon: "warning",
            });
        } else if(this.state.fileFormatValue !== 'csv'){
            swal({
                title: "Sorry! You have selected wrong file format!",
                icon: "warning",
            });
        } else {
            swal({
              title: "Are you sure want to upload WHONET file?",
              //text: "Once uploaded, you will not be able to recover WHONET-DHIS2 data!",
              icon: "warning",
              buttons: true,
              dangerMode: true,
            })
            .then((willUpload) => {
                
              if (willUpload) {
                this.importCSVFile();
              } else {
                swal({
                    title: "Your uploading file is safe!",
                    icon: "success",
                });
              }
            });
        }   

        
    }
    handleModal = () => {
        this.setState({ isModalOpen: !this.state.isModalOpen });
    };

    render() {
        let spinner;
        if(this.state.loading){
          spinner = <LinearProgress />
        } 

    return (
      <div>
          <Card style={styles.card}>
              <CardText style={styles.cardText}>
                  
                  <h3 style={styles.cardHeader}>IMPORT ORG UNIT CSV FILE! 
                  </h3> 

                  <InputField
                    label="Organisation Unit"
                    value={this.props.orgUnit}
                    disabled
                    onChange={(value) => this.onChangeValue("orgUnitField", value)}
                    name = "selectedOrgUnit"
                  /><input
                    type="hidden" id="selectedOrgUnitId" value ={this.props.orgUnitId}
                    />
                  <br /><br />
                  <input
                    type="file"
                    ref={input => {
                      this.filesInput = input;
                    }}
                    name="file"
                    placeholder={null}
                    onChange={this.handleChangeFileUpload}                  
                    accept=".csv"
                  />
                  <div style={styles.buttonPosition}></div>
                  <Button type="submit" raised color='primary' onClick={this.uploadAlertShow}>IMPORT</Button>

                  <br />                  

              </CardText>
              <CardText style={styles.cardText}>
                {spinner} 
              </CardText>

          </Card>
      </div>

    );
  }
}

export default withStyles(styles)(WHONETFileReader);