import React from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";

import Dashboard from "./components/Dashboard";

export default function Routes() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Dashboard}/>

        
      </Switch>
    </Router>
  )
}

