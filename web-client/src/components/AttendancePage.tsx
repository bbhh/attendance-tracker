import React, { useState, useEffect } from 'react';
import { AppBar, Box, Button, ButtonGroup, Checkbox, List, ListItem, ListItemIcon, ListItemText, makeStyles, Toolbar, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { ArrowLeft, ArrowRight, Today } from '@material-ui/icons';
import axios from 'axios';

import { Person, renderPerson } from '../models/Person';
import { Attendance } from '../models/Attendance';
import Constants from '../utils/Constants';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  body: {
    marginBottom: '56px',
  },
});

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

// if today is Sunday, return today; otherwise, return previous Sunday
function getCurrentSunday(): Date {
  const today = new Date();
  const sunday = new Date();
  sunday.setDate(today.getDate() - today.getDay());
  return sunday;
}

function AttendancePage() {
  const classes = useStyles();
  
  const [date, setDate] = useState(getCurrentSunday());
  const [persons, setPersons] = useState([]);
  const [attendance, setAttendance] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetch = async () => {
      console.log('Retrieving persons...');
      try {
        const result = await axios.get(`${Constants.API_BASE_URL}/persons`);
        setPersons(result.data);
      } catch (error) {
        if (error.response) {
          setErrorMessage(error.response.data.error);
        }
      }
    };

    fetch();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      console.log('Retrieving attendance...');
      try {
        const shortDate = formatShortDate(date);
        const result = await axios.get(`${Constants.API_BASE_URL}/attendances`, { params: { date: shortDate } });

        const newAttendance = new Set();
        result.data.forEach(({ person_id }: Attendance) => {
          newAttendance.add(person_id);
        });
        setAttendance(newAttendance);
      } catch (error) {
        if (error.response) {
          setErrorMessage(error.response.data.error);
        }
      }
    };

    fetch();
  }, [date]);

  const jumpToCurrentSunday = () => {
    setDate(getCurrentSunday());
  };

  const updateAttendance = async(personId: number, present: boolean) => {
    console.log(`Updating attendance for person ${personId} to ${present}...`);
      try {
        const shortDate = formatShortDate(date);
        await axios.put(`${Constants.API_BASE_URL}/attendances/${shortDate}/${personId}`, { present });
      } catch (error) {
        if (error.response) {
          setErrorMessage(error.response.data.error);
        }
      }
  };

  const handleStepDayClick = (delta: number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + delta);
    setDate(newDate);
  };

  const handleToggle = (personId: number) => () => {
    let present = false;
    const newAttendance = new Set(attendance);
    if (newAttendance.has(personId)) {
      newAttendance.delete(personId);
    }
    else {
      newAttendance.add(personId);
      present = true;
    }
    setAttendance(newAttendance);
    
    // update in backend
    updateAttendance(personId, present);
  };

  return (
    <div className={classes.root}>
      <AppBar position="sticky">
        <Toolbar>
          <Box display="flex" flexGrow={1}>
            <Typography variant="h6">
              {formatLongDate(date)}
            </Typography>
          </Box>
          <ButtonGroup variant="text">
            <Button color="inherit" onClick={() => jumpToCurrentSunday()}><Today /></Button>
            <Button color="inherit" onClick={() => handleStepDayClick(-Constants.CALENDAR_JUMP_IN_DAYS)}><ArrowLeft /></Button>
            <Button color="inherit" onClick={() => handleStepDayClick(Constants.CALENDAR_JUMP_IN_DAYS)}><ArrowRight /></Button>
          </ButtonGroup>
        </Toolbar>
      </AppBar>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <List className={classes.body}>
        {persons.map((person: Person) => {
          const { id } = person;

          return (
            <ListItem key={id} role={undefined} dense button onClick={handleToggle(id)}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={attendance.has(id)}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText primary={renderPerson(person)} />
            </ListItem>
          );
        })}
      </List>
    </div>
  );
};

export default AttendancePage;