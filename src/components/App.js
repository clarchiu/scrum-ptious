import '../styles/App.css';
import { useState, useEffect } from 'react';
import { Route, BrowserRouter as Router, Switch, withRouter } from 'react-router-dom';

import Dashboard from './Dashboard';
import Tasks from './Tasks';
import Chat from './Chat';
import Submissions from './Submissions';
import Sidebar from './Sidebar';
import UserPanel from './UserPanel';
import Login from './Login';

import useApplicationData from '../hooks/useApplicationData';
import useNotifications from '../hooks/useNotifications';
import useSocket from '../hooks/useSocket';
import useTasks from '../hooks/useTasks';
import useSidePanel from '../hooks/useSidePanel';

import { taskStatus } from '../helpers/taskStatus';
import { NotificationManager, NotificationContainer } from 'react-notifications';


import 'react-pro-sidebar/dist/css/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-datepicker/dist/react-datepicker.css";
import 'react-notifications/lib/notifications.css';
import 'react-tabs/style/react-tabs.css';
import { Button } from 'react-bootstrap';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';

const DASHBOARD = "Dashboard";
const TASKS = "Tasks";
const CHAT = "Chat";
const SUBMISSIONS = "Submissions"

function App() {
  const [selectedMenu, setMenu] = useState(DASHBOARD);
  const [theme, setTheme] = useState("light");
  const [loginToken, setLoginToken] = useState(0);
  const [errorNotification, setErrorNotification] = useState({
    title: "",
    message: "",
  });

  const LightTheme = {
    sidebarBackground: "linear-gradient(to left, hsl(241, 96%, 56%), hsl(266, 100%, 57%));",
    titleColor: "#dc658b",
    tagLineColor: "black"
  };

  const DarkTheme = {
    sidebarBackground: "#282c36",
    titleColor: "lightpink",
    tagLineColor: "lavender",
  };

  const themes = {
    light: LightTheme,
    dark: DarkTheme,
  }
  
  const Navsidebar = styled.div`
  background: ${props => props.theme.sidebarBackground};
  transition: all .5s ease;
  `;

  const appContainer = styled.div`
  
  `;

  const userPanel = styled.div`
  background: ${props => props.theme.pageBackground};
  `;

  const { socket } = useSocket();

  const { 
    state,
    setTasks,  
    setSubmissions,
  } = useApplicationData(socket, loginToken, setErrorNotification);
  
  const {
    userTasks,
    userInfo,
    role,
    teamTasks,
    teamUsers,
    deadlines,
    submissions
  } = state;

  const { 
    userNotification,
    managerNotification,
    setUserNotification,
    setManagerNotification
  } = useNotifications(userInfo, setMenu, NotificationManager);

  const {
    moveTask,
    createTaskItem,
    editTaskItem,
    deleteTaskItem,
    submitTaskItem,
    giveFeedback,
  } = useTasks(loginToken, socket, submissions, setTasks, setSubmissions, setUserNotification, setManagerNotification, userInfo);

  useEffect(() => {
    if (errorNotification.message !== "") {
      NotificationManager.error(errorNotification.title, errorNotification.message);
      setErrorNotification(prev => ({...prev, title: "", message: ""}))
    }
  }, [errorNotification]);

  function changeTheme() {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };


  if ( loginToken === 0 ) {
    return (
      <Login setLogin={setLoginToken}/> 
    )
  }

  return (
    <ThemeProvider theme={themes[theme]}>
    <div className="app-container">
      <NotificationContainer />
      <Navsidebar className="sidebar">
      {/* <section className="sidebar"> */}
        <img 
          alt="Scrum-ptious Logo"
          className="sidebar-centered"
          src="https://logoipsum.com/logo/logo-25.svg"
        />
        <nav className="sidebar__menu">
          <Sidebar
            selectedMenu={selectedMenu}
            userInfo={userInfo}
            teamUsers={teamUsers}
            setMenu={setMenu}
            createTaskItem={createTaskItem}
            errorNotification={errorNotification}
            setErrorNotification={setErrorNotification}
          />
          <button onClick={changeTheme}>
            Yeet mode
          </button>
        </nav>
        <span 
          className="logout"
          onClick={() => setLoginToken(0)}
        >
            Log out
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </span>
        </Navsidebar>
      {/* </section> */}
      {/* <div className="wrapper"> */}
        <section className="dashboard-main">
          { selectedMenu === DASHBOARD && 
            <Dashboard
              tasks={userTasks} 
              role={role} 
              teamTasks={teamTasks}
              teamUsers={teamUsers}
            /> }
          { selectedMenu === TASKS && 
            <Tasks 
              socket={socket} 
              role={role} 
              tasks={role === 1 ? teamTasks : userTasks} 
              teamUsers={teamUsers} 
              submissions={submissions}
              deleteTaskItem={deleteTaskItem} 
              editTaskItem={editTaskItem}
              submitTaskItem={submitTaskItem}
              setErrorNotification={setErrorNotification}
              moveTask={moveTask}
              setTasks={setTasks}
            />}
          { selectedMenu === CHAT && 
            <Chat 
              socket={socket} 
              userInfo={userInfo} 
              teamUsers={teamUsers}
            />}
          { selectedMenu === SUBMISSIONS &&
            <Submissions
              teamUsers={teamUsers}
              teamTasks={teamTasks}
              giveFeedback={giveFeedback}
              setUserNotification={setUserNotification}
              user={userInfo}
            />}
        </section>
        <section className="user__info">
          <UserPanel 
            // wide={windowWidth > 1300}
            userInfo={userInfo} 
            tasks={teamTasks} 
            teamUsers={teamUsers} 
          /> 
        </section>
      {/* </div> */}
    </div>
    </ThemeProvider>
  );
}

export default App