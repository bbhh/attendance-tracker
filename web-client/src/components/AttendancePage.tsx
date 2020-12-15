import React, { useState, useEffect } from 'react';
import { AppBar, Button, ButtonGroup, Checkbox, fade, InputBase, List, ListItem, ListItemIcon, ListItemText, makeStyles, Menu, MenuItem, Theme, Toolbar, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { ChevronLeft, ChevronRight, MoreVert, Search, Today } from '@material-ui/icons';
import axios from 'axios';

import { Person, renderPerson } from '../models/Person';
import { Attendance } from '../models/Attendance';
import Constants from '../utils/Constants';

const useStyles = makeStyles((theme: Theme) =>
({
  root: {
    width: '100%',
  },
  date: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
  },
  menuText: {
    marginLeft: theme.spacing(1),
  },
  body: {
    marginBottom: '56px',
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { year: '2-digit', month: 'numeric', day: 'numeric' }).format(date);
}

function formatIsoDate(date: Date): string {
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
  const [filter, setFilter] = useState('');
  const [persons, setPersons] = useState([]);
  const [attendance, setAttendance] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState('');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleShowMoreMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMoreMenu = () => {
    setAnchorEl(null);
  };

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
        const shortDate = formatIsoDate(date);
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
    handleCloseMoreMenu();
  };

  const handleStepDayClick = (delta: number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + delta);
    setDate(newDate);
    handleCloseMoreMenu();
  };

  const updateAttendance = async (personId: number, present: boolean) => {
    console.log(`Updating attendance for person ${personId} to ${present}...`);
    try {
      const shortDate = formatIsoDate(date);
      await axios.put(`${Constants.API_BASE_URL}/attendances/${shortDate}/${personId}`, { present });
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error);
      }
    }
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value.trim().toLowerCase());
  };

  const filteredPersons = persons.filter((person: Person) => {
    if (!filter) return true;

    return person.first_name.toLowerCase().indexOf(filter) !== -1 || person.last_name.toLowerCase().indexOf(filter) !== -1;
  });

  return (
    <div className={classes.root}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" className={classes.date}>
            {formatShortDate(date)}
          </Typography>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <Search />
            </div>
            <InputBase
              placeholder="Search"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              onChange={handleSearchChange}
            />
          </div>
          <ButtonGroup variant="text">
            <Button color="inherit" onClick={handleShowMoreMenu}><MoreVert /></Button>
          </ButtonGroup>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleCloseMoreMenu}
          >
            <MenuItem onClick={jumpToCurrentSunday}><Today /><span className={classes.menuText}>Current Sunday</span></MenuItem>
            <MenuItem onClick={() => handleStepDayClick(-Constants.CALENDAR_JUMP_IN_DAYS)}><ChevronLeft /><span className={classes.menuText}>Previous Sunday</span></MenuItem>
            <MenuItem onClick={() => handleStepDayClick(Constants.CALENDAR_JUMP_IN_DAYS)}><ChevronRight /><span className={classes.menuText}>Next Sunday</span></MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <List className={classes.body}>
        {filteredPersons.map((person: Person) => {
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