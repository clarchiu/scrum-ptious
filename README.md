# Scrum-ptious

A workflow dashboard that maximizes your team's efficiency by allowing assignment and tracking of tasks, as well as communications between teammates via chat. 

Socket.io is hooked into the Express server so that all data is pushed to clients in real time. Users are then immediately notified of these changes.

Developed for demonstration purposes for the final project of Lighthouse Labs Web Development Bootcamp

## Tech Stack
* PostgresSql
* Express
* React.js
* Node.js
* Socket.io

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Overview

### Dashboard

The dashboard gives an overview of a project's progress. Using React-chartjs to visualize the portion of tasks that are assigned, in progress, in review, completed and late. The manager can also see the individual progress of his team members. 

<p float="left">
  <img alt="Responive user interface with collapsible side menu" src="/docs/ui-dashboard.png" width="45%" />
  <img alt="Responive user interface with collapsible side menu" src="./docs/ui-expanded-userInfo.png" width="45%" /> 
</p>

### Tasks

Tasks are organized into a kanban board with columns for 'assigned', 'in progress' and 'completed'.

<p float="left">
  <img alt="Kanban board for 'assigned','in-progress' and 'completed' tasks" src="./docs/tasks-kanban.png" width="50%" />
  <img alt="Manager modal for creating tasks" src="./docs/create-new-task.png" width="40%" />
</p>

Managers can create and assign tasks to his team members. Employees can see their assigned tasks updated in real time and drag them to the 'in progress' column to notify their manager that they are working on it. 

![Realtime Notification](./docs/user-notification.png)

### Chat

Users can communicate with their team via a built-in chat feature

<img alt="Chat feature" src="./docs/real-time-chat.png" width="65%" />

### Submissions

Employees can select a task and submit it for submission. Upon submission, managers can either accept or reject it, as well as give feedback

<p float="left">
  <img alt="employee submission" src="./docs/employee-submission.png" width="45%" />
  <img alt="manager review" src="./docs/review-submission.png" width="45%" />
</p>

## License
[MIT](htps://choosealicense.com/licenses/mit/)
