import React, { Component } from "react";
import AppBar from 'material-ui/AppBar';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Thermometer from 'react-thermometer-component'



import {
    grey900,
    darkBlack
} from 'material-ui/styles/colors';


const muiTheme2 = getMuiTheme({
    palette: {
        textColor: darkBlack,
        primary1Color: grey900,
    },
    appBar: {
        height: 50,
    },
});

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            url: "",
            text: "",
            numSentences: "",
            summary: "",
            percent: 0
        };
    }


    handleUrlChange = (url, text) => {
        this.setState({
            url: text
        });
    }

    handleTextChange = (event) =>{
        this.setState({
            text: event.target.value
        });
    }

    handleNumberChange = (numSentences, text) => {
        this.setState({
            numSentences: text
        });
    }

    handleClick = (event) => {
        console.log('app.js -> url: ' + this.state.url);
        var rData = {}
        rData['url'] = '';
        rData['text'] = this.state.text;
        rData['sentnum'] = this.state.numSentences;
        var url = 'http://localhost:5000/summarize'
        console.log('app.js -> handleClick url: ' + url);
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body : JSON.stringify(rData)
        }).then(results => {
            if(results.status === 200)
                return results.json()
        }).then(async (responseJson) => {
            console.log("Summary Accuracy " + responseJson["percentage"]);
            var textToSet = "";

            var summaryData = responseJson["summary"].sentences;
            for (var index = 0; index < summaryData.length; index++) {
                textToSet = textToSet + summaryData[index];
            }
            this.setState({
                summary: textToSet,
                percent: responseJson["percentage"]
            });
        });
    }


    render() {
        return (
            <MuiThemeProvider muiTheme={muiTheme2}>
                <div>
                    <AppBar title="AccuSummary" iconClassNameRight="muidocs-icon-navigation-expand-more"/>

                    <div style={styles.textSummaryContainer}>
                        <div style={styles.general}>
                            <h4>Enter url to summarize here</h4>
                            <TextField
                                hintText = "url"
                                onChange = {(url, text) => {this.handleUrlChange(url, text)}}
                                disabled = {true}
                            />
                        </div>
                        <div style={styles.general}>
                            <h4>-OR-  Copy and Paste text to summarize here</h4>
                            <textarea
                                id="summaryField"
                                onChange={this.handleTextChange}
                                style={{marginTop: '20px', height: '200px', maxHeight: '200px',  width: '650px'}}
                            />
                        </div>
                    </div>
                    <div style={styles.general}>
                    <h4>Enter number of sentences in summary here</h4>
                    <TextField
                        hintText = "number of sentences"
                        onChange = {(numSentences, text) => {this.handleNumberChange(numSentences, text)}}
                    />
                    </div>
                    <RaisedButton 
                        label = "Summarize" 
                        style = {style} 
                        onClick = {this.handleClick.bind(this)}/>
                    <br></br>

                    <div style={styles.textSummaryContainer}>
                        <div style={styles.textSummary}>
                            <textarea
                              disabled
                              id="summaryField"
                              value={this.state.summary}
                              style={{marginTop: '20px', height: '85%', width: '95%'}}
                            />
                        </div>
                        <div style={styles.textAccuracy}>
                            <Thermometer
                                theme={'light'}
                                value={this.state.percent}
                                max={100}
                                format={'%'}
                                steps={1}
                                size={'small'}
                                style={{height: '90%'}}
                            />
                        </div>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}
//
const style = {
  margin: 12,
};

const styles = {
  textSummaryContainer : {
    width : '1000px',
    height : '300px',
    marginTop : '20px',
    overflow : 'hidden',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  textSummary : {
    width : '100%',
    height : '100%',
    marginLeft : '20px',
    justifyContent: 'left',

  },
  textAccuracy : {
    float : 'left',
    height : '100%',
  },
  accuracyThermometer : {
    height : 200,
  },
  general : {
        marginLeft : '30px'
  } 
}

export default App;

