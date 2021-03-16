import React, { useState, useEffect } from 'react';
import { AppBar, CircularProgress, Grid, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Check } from '@material-ui/icons';
import { green } from '@material-ui/core/colors';
import axios from 'axios';

import { PersonWithHistory, renderPersonWithHistory } from '../models/PersonWithHistory';
import Constants from '../utils/Constants';
import { formatIsoDate, formatShortDate, getCurrentSunday, jumpDateBackward } from '../utils/Functions';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  loading: {
    height: '100%',
    width: '100%',
  },
  container: {
    maxHeight: 'calc(100vh - 120px)',
  },
  table: {
    minWidth: '650px',
  },
});

const checkIcon = <Check style={{ color: green[500] }} />;

function generateDates(): string[] {
  const startDate = new Date(Constants.START_DATE);
  const endDate = getCurrentSunday();

  const dates = [];
  let currDate = endDate;
  while (currDate >= startDate) {
    dates.push(currDate);
    currDate = jumpDateBackward(currDate);
  }

  return dates.map((date) => formatIsoDate(date));
}

function MembersPage() {
  const classes = useStyles();

  const [persons, setPersons] = useState([]);
  const [personsRetrieved, setPersonsRetrieved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetch = async () => {
      console.log('Retrieving persons...');
      try {
        const result = await axios.get(`${Constants.API_BASE_URL}/persons?include_history=true`);
        setPersons(result.data);
        setPersonsRetrieved(true);
      } catch (error) {
        if (error.response) {
          setErrorMessage(error.response.data);
        }
      }
    };

    fetch();
  }, [personsRetrieved]);

  let body;
  if (!personsRetrieved) {
    body = (
      <Grid container
        spacing={0} direction="column"
        alignItems="center" justify="center"
        style={{ minHeight: '100vh' }}>
        <CircularProgress disableShrink />
      </Grid>
    );
  }
  else {
    const dates = generateDates();
    const dateColumns = dates.map((date) => (
      <TableCell key={date} align="center">{formatShortDate(new Date(date))}</TableCell>
    ));
    const rows = persons.map((personWithHistory: PersonWithHistory) => {
      const { person: { id }, attendances } = personWithHistory;

      const history = dates.map((date) => (
        <TableCell key={`${id}-${date}`} align="center">{attendances.includes(date) && checkIcon}</TableCell>
      ));

      return (
        <TableRow key={id}>
          <TableCell component="th" scope="row">
            {renderPersonWithHistory(personWithHistory)}
          </TableCell>
          <TableCell align="center">{attendances.length}</TableCell>
          {history}
        </TableRow>
      );
    });

    body = (
      <TableContainer component={Paper} className={classes.container}>
        <Table className={classes.table} stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="center">Total</TableCell>
              {dateColumns}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <div className={classes.root}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">
            Members
          </Typography>
        </Toolbar>
      </AppBar>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {body}
    </div>
  );
}

export default MembersPage;