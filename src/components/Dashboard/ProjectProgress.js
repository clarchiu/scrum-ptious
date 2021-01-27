import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { taskStatus, lateTaskStatus } from '../../helpers/taskStatus';
import styled from 'styled-components';

// import ProjectProgressListItem from './ProjectProgressListItem';

export default function ProjectProgress(props) {

  const assignedTasks = taskStatus(0, props.teamTasks);
  const inProgressTasks = taskStatus(1, props.teamTasks);
  const inReviewTasks = taskStatus(2, props.teamTasks);
  const completeTasks = taskStatus(3, props.teamTasks);
  const lateTasks = lateTaskStatus(props.teamTasks);

  const ProjectProgress = styled.div`
  border: ${props => props.theme.chartBorder};
  background: ${props => props.theme.chartBackground};
  color: white;
  `;


  return (
    <ProjectProgress className="project-progress">
      <Doughnut
        data={{
          labels: ['Assigned', 'In-progress', 'In-review', 'Late', 'Complete'],
          datasets: [
            {
              label: '# of tasks',
              data: [assignedTasks, inProgressTasks, inReviewTasks, lateTasks, completeTasks],
              backgroundColor: [
                'rgba(28, 20, 255, 0.8)',
                'rgba(255, 247, 20, 0.8)',
                'rgba(232, 86, 2, 0.8)',
                'rgba(255, 20, 20, 0.8)',
                'rgba(33, 232, 2, 0.8)',
              ]
            }
          ],
        }}
        height={400}
        width={600}
        options={{
          maintainAspectRatio: false,
          title: {
            display: true,
            text: 'Project Progress',
            fontSize: 25,
            fontFamily: 'Poppins',
            fontColor: props.theme === 'light' ? '' : 'white',
          },
          legend: {
            display: true,
            position: 'right',
            fontColor: props.theme === 'light' ? '' : 'white',
            labels: {
              fontColor: props.theme === 'light' ? '' : 'white',
            }
          }
        }}
      />
      </ProjectProgress>
  )
}