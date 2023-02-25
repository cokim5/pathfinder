/*
 * Copyright (C) 2022 Kevin Zatloukal and James Wilcox.  All rights reserved.  Permission is
 * hereby granted to students registered for University of Washington
 * CSE 331 for use solely during Autumn Quarter 2022 for purposes of
 * the course.  No other use, copying, distribution, or modification
 * is permitted without prior written consent. Copyrights for
 * third-party components of this work must be honored.  Instructors
 * interested in reusing these course materials should contact the
 * author.
 */

import React, {Component} from 'react';

// Allows us to write CSS styles inside App.css, any styles will apply to all components inside <App />
import "./App.css";
import Map from "./Map";
import Select from "react-select";

// start is object containing both short and long name of starting building
// end is object containing both short and long name of end building
// buildings is array containing array of objects that represent each building on campus
// path is array containing objects that represents a path from one node to another node
// that builds up the shortest path from start to end
// directions is array containing list of text directions for user to follow from start to end
// displayPopup holds the state on whether the popup should be displayed or not in a boolean
interface AppState {
    start: any,
    end: any,
    buildings: any[],
    path: any[],
    directions: any[],
    displayPopup: boolean
}

class App extends Component<{}, AppState> {
    constructor(props: any) {
        super(props);
        this.state = {
            start: null,
            end: null,
            buildings: [],
            path: [],
            directions: [],
            displayPopup: false
        };
    }

    // When page is loaded fetches building data and updates the state of the buildings array
    // alerts error if the server is not running
    componentDidMount = async() =>  {
        try {
            // makes request to get buildings
            let resPromise = fetch('http://localhost:4567/getBuildings');
            let res = await resPromise;
            let parsePromise = res.json();
            let parsed = await parsePromise;
            let longNameArray: any[] = Object.values(parsed);
            let shortNameArray: any[] = Object.keys(parsed);
            let buildingObjectArray: any[] = [];
            // puts the both long and short name into building array
            for(let i = 0; i < longNameArray.length; i++) {
                let buildingObject = {
                    LONG: longNameArray[i],
                    SHORT: shortNameArray[i]
                }
                buildingObjectArray.push(buildingObject);
            }
            // updates the state and adds buildings
            this.setState({buildings: buildingObjectArray});
        } catch (e) {
            alert("Server is not currently active. Server must be connected for website to run");
        }
    }

    // updates start state when start value changed
    onStartChange = (value: any) => {
        this.setState({start: value});
    }

    // updates end state when end value changed
    onEndChange = (value: any) => {
        this.setState({end: value});
    }

    // opens directions popup if directions button pressed and both start and end are filled
    openPopup = () => {
        if(this.state.start == null || this.state.end == null) {
            alert("Please fill out start and end fields!");
            return;
        }
        this.setState({displayPopup: true,}, this.getDirections)
    }

    // closes directions popup
    closePopup = () => {
        this.setState({displayPopup: false}, this.callbackFunction)
    }

    // just a utility added this function to prevent an compilation error that was occurring
    callbackFunction = () => {
        console.log(this.state.path);
    }

    // sets state of everything besides buildings to null to clear screen and directions
    resetScreen = () => {
        this.setState({
            start: null,
            end: null,
            path: [],
            directions: [],
            displayPopup: false
        })
    }

    // makes request to get shortest path from Spark server
    getShortestPath = async() => {
        if(this.state.start == null || this.state.end == null) {
            alert("Please fill out start and end fields!");
            return;
        }
        try {
            let resPromise = fetch(`http://localhost:4567/getPath?start=${this.state.start.SHORT}&end=${this.state.end.SHORT}`);
            let res = await resPromise;
            let parsePromise = res.json();
            let parsed = await parsePromise;
            let path = parsed.path;
            let pathArray: any[] = [];
            // adds the path with an id of index to path array
            for(let i = 0; i < path.length; i++) {
                path[i]["id"] = i;
                pathArray.push(path[i]);
            }
            this.setState({path: pathArray}, this.getDirections);
        } catch (e) {
            alert("Ensure that server is connected and try again");
        }
    }

    // makes request to get directinos from spark server
    getDirections = async() => {
        if(this.state.start == null || this.state.end == null) {
            alert("Please fill out start and end fields!");
            return;
        }
        try {
            let resPromise = fetch(`http://localhost:4567/getDirections?start=${this.state.start.SHORT}&end=${this.state.end.SHORT}`);
            let res = await resPromise;
            let parsePromise = res.json();
            let directionsParsed = await parsePromise;
            this.setState({directions: directionsParsed});
        } catch (e) {
            alert("Ensure that the server is connected and try again");
        }
    }

    render() {
        return (
            <div>
                {
                    this.state.displayPopup ?
                        <div id="popupContainer">
                            <div id="popupButtonContainer">
                                <button onClick={this.closePopup} id="closePopupButton">X</button>
                            </div>
                            <div id="directionListContainer">
                                {
                                    this.state.directions.map((item) => {
                                        return (
                                            <div id="itemView">
                                                <p className="itemText">{item}</p>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div> : null
                }
                <div id="fieldsContainer">
                    <p id="titleText">UW Campus Paths</p>
                    <p id="bodyText">Input a starting and ending building to view the shortest path</p>
                    <div className="inputContainer">
                        <p className="itemText">start:</p>
                        <Select
                            className="select"
                            name="start"
                            options={this.state.buildings}
                            value={this.state.start}
                            onChange={this.onStartChange}
                            getOptionLabel={(option) => option.LONG}
                            getOptionValue={(option) => option}
                        />
                    </div>
                    <div className="inputContainer">
                        <p className="itemText">end:</p>
                        <Select
                            className="select"
                            name="end"
                            options={this.state.buildings}
                            value={this.state.end}
                            onChange={this.onEndChange}
                            getOptionLabel={(option) => option.LONG}
                            getOptionValue={(option) => option}
                        />
                    </div>
                    <div id="buttonContainer">
                        <button onClick={this.getShortestPath} className="button">Search</button>
                        <button onClick={this.resetScreen} className="button">Reset</button>
                    </div>
                    <button onClick={this.openPopup} id="popupButton">Directions</button>
                </div>
                <Map path={this.state.path} />
            </div>
        );
    }

}

export default App;
