import React, { useState, useEffect } from 'react';
import { AppBar, Box, Button, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, makeStyles, Toolbar, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Delete, Edit, PersonAdd } from '@material-ui/icons';
import axios from 'axios';

import { Person, renderPerson } from '../models/Person';
import Constants from '../utils/Constants';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  body: {
    marginBottom: '56px',
  },
});

function MembersPage() {
  const classes = useStyles();

  const [persons, setPersons] = useState([]);
  const [personsRetrieved, setPersonsRetrieved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetch = async () => {
      console.log('Retrieving persons...');
      try {
        const result = await axios.get(`${Constants.API_BASE_URL}/persons`);
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

  return (
    <div className={classes.root}>
      <AppBar position="sticky">
        <Toolbar>
          <Box display="flex" flexGrow={1}>
            <Typography variant="h6">
              Members
            </Typography>
          </Box>
          <Button color="inherit" disabled><PersonAdd /></Button>
        </Toolbar>
      </AppBar>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <List className={classes.body}>
        {persons.map((person: Person) => {
          const { id } = person;

          return (
            <ListItem key={id} role={undefined}>
              <ListItemText primary={renderPerson(person)} />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="edit" disabled>
                  <Edit />
                </IconButton>
                <IconButton edge="end" aria-label="delete" disabled>
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}

export default MembersPage;