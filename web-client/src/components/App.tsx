import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, AppBar, Grid, makeStyles } from '@material-ui/core';
import { EventAvailable, SupervisorAccount } from '@material-ui/icons';
import { MemoryRouter, Switch, Route, Link } from 'react-router-dom';

import AttendancePage from './AttendancePage';
import MembersPage from './MembersPage';

const useStyles = makeStyles({
  footer: {
    top: 'auto',
    bottom: 0
  }
});

function App() {
  const classes = useStyles();

  const [route, setRoute] = useState('attendance');

  return (
    <MemoryRouter>
      <Grid container alignItems="center" justify="center">
        <Switch>
          <Route exact path="/">
            <AttendancePage />
          </Route>
          <Route path="/members">
            <MembersPage />
          </Route>
        </Switch>

        <AppBar position="fixed" color="primary" className={classes.footer}>
          <BottomNavigation
            value={route}
            onChange={(event, newValue) => {
              console.log(`Setting to ${newValue}`);
              setRoute(newValue);
            }}
            showLabels
          >
            <BottomNavigationAction value="attendance" component={Link} to="/" label="Attendance" icon={<EventAvailable />} />
            <BottomNavigationAction value="members" component={Link} to="/members" label="Members" icon={<SupervisorAccount />} />
          </BottomNavigation>
        </AppBar>
      </Grid>
    </MemoryRouter>
  );
}

export default App;
