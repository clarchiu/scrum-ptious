import '../styles/App.css';
import { useState, useEffect } from 'react';
import { Route, BrowserRouter as Router, Switch, withRouter } from 'react-router-dom';

import Dashboard from './Dashboard';
import Tasks from './Tasks';
import Chat from './Chat';
import PerformanceReview from './Performance-Review/';
import Sidebar from './Sidebar';
import UserInfo from './Dashboard/UserInfo';
import Login from './Login';

import useApplicationData from '../hooks/useApplicationData';
import useSocket from '../hooks/useSocket';
import useTasks from '../hooks/useTasks'
import { taskStatus } from '../helpers/taskStatus';
import { NotificationManager, NotificationContainer } from 'react-notifications';

import 'react-pro-sidebar/dist/css/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-datepicker/dist/react-datepicker.css";
import 'react-notifications/lib/notifications.css';
import 'react-tabs/style/react-tabs.css';

const DASHBOARD = "Dashboard";
const TASKS = "Tasks";
const CHAT = "Chat";
const PERFORMANCE_REVIEW = "Performance Review"

function App() {
  const [loginToken, setLoginToken] = useState(0);
  const { socket } = useSocket();
  const [notification, setNotification] = useState(0);
  const [error, setError] = useState("");

  const { 
    state,
    setMenu,
    taskSetters
  } = useApplicationData(socket, loginToken);

  const {
    menu,
    userTasks,
    userInfo,
    role,
    teamTasks,
    teamUsers,
    allTasks,
    deadlines
  } = state;

  const {
    createTaskItem,
    editTaskItem,
    deleteTaskItem,
    submitTaskItem,
  } = useTasks(loginToken, socket, taskSetters, setNotification);
  
  useEffect(() => {
    if (notification && notification === userInfo.id) {
      NotificationManager.warning('Click to view', 'Your Tasks Have Been Updated', 5000, () => {
        setMenu(TASKS)
      });
    }
    setNotification(0);
    if (error) {
      console.log(error);
    }
  }, [notification, error])

  if ( loginToken === 0 ) {
    return (
      <section className="main">
        { loginToken === 0 && <Login setLogin={setLoginToken}/> }
      </section>
    )
  }

  return (
    <div className="container">
      <NotificationContainer />
      <section className="sidebar">
        <img 
          alt="Scrum-ptious Logo"
          className="sidebar-centered"
          src="https://logoipsum.com/logo/logo-25.svg"
        />
        <nav className="sidebar__menu">
          <Sidebar
            setMenu={setMenu}
            userInfo={userInfo}
            teamUsers={teamUsers}
            createTaskItem={createTaskItem}
          />
        </nav>
        <button onClick={() => setLoginToken(0)}>
          Log out
        </button>
      </section>
      <section className="main">
        { menu === DASHBOARD && 
          <Dashboard
            tasks={userTasks} 
            role={role} 
            teamTasks={teamTasks}
            teamUsers={teamUsers}
            allTasks={allTasks}
          /> }
        { menu === TASKS && 
          <Tasks 
            socket={socket} 
            role={role} 
            tasks={role === 1 ? teamTasks : userTasks} 
            teamUsers={teamUsers} 
            deleteTaskItem={deleteTaskItem} 
            editTaskItem={editTaskItem}
            submitTaskItem={submitTaskItem}
          />}
        { menu === CHAT && 
          <Chat 
            socket={socket} 
            userInfo={userInfo} 
            teamUsers={teamUsers}
          />}
        { menu === PERFORMANCE_REVIEW &&
        <PerformanceReview
          teamUsers={teamUsers}
          teamTasks={teamTasks}
        />}
      </section>
      <section className="user__info">
        <UserInfo userInfo={userInfo} deadlines={deadlines} /> 
      </section>
    </div>
  );
}

export default App