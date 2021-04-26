import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import PageHome from './pages/home/home';
import PageEditor from './pages/editor/editor';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact = { true } path = '/'>
          <PageHome />
        </Route>
        <Route path = '/code/:id' component = { PageEditor } />
        <Route path = '*'>
          <Redirect to = '/' />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
