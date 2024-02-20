import React from "react";
import { useEffect, useState } from "react";
import { isSameDay } from "date-fns";
import TaskCard from "./TaskCard";
import { saveToLocalStorage } from "./TaskHandler";
import CommentModal from "./CommentModal";
import "./Task.css";
import setOccurrences from "./Occurrences";

const Task = ({ storedData, handleSetData, categoryId, activityId, task, datesAndDays }) => {
  const [taskState, setTaskState] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState({})

  useEffect(() => {
    if (task) {
      (task.repetition && !task.occurrences)
        ? (task["occurrences"] = setOccurrences(task.day))
        : task;
      setTaskState(task);
    }    
  }, []);

  const handleTaskStatusChange = (type, taskId, task) => {
    if(task.status === false) {
      setSelectedTask({
        type: type,
        taskId: taskId,
        task: task
      })
      setShowModal(true)
    }

    let updatedTasks = taskState
    switch(type) {
      case "occurrence":
        if (taskId === updatedTasks.id) {
          updatedTasks = {
            ...updatedTasks,
            occurrences: updatedTasks.occurrences.map((o) => {
              return o.date === task.date ? { ...o, status: !o.status } : o;
            })
          }
        }
      break;

      case "task":
        if(taskId === updatedTasks.id) {
          updatedTasks = {
            ...updatedTasks,
            status: !updatedTasks.status
          }          
        }
      break;

      default:
        return updatedTasks;
    }

    setTaskState(updatedTasks);
    saveToLocalStorage({type: "task", categoryId, activityId, taskId, updatedData: updatedTasks, storedData, handleSetData});   
    
  };

  const handleSaveComment = (type, taskId, task, comment) => {
    if(comment !== "") {
      let updatedTasks = taskState
      switch(type) {
        case "occurrence":
          if (taskId === updatedTasks.id) {
            updatedTasks = {
              ...updatedTasks,
              occurrences: updatedTasks.occurrences.map((o) => {
                return o.date === task.date ? { ...o, comment: comment } : o;
              })
            }
          }
        break;
  
        case "task":
          if(taskId === updatedTasks.id) {
            updatedTasks = {
              ...updatedTasks,
              comment: comment
            }          
          }
        break;
  
        default:
          return updatedTasks;
      }  
       
      setTaskState(updatedTasks);
      saveToLocalStorage({type: "task", categoryId, activityId, taskId, updatedData: updatedTasks, storedData, handleSetData});  

    } 
    setShowModal(false) 
    
  };
  
  const handleCloseModal = () => {  
    setShowModal(false);
  };

  const handleTaskDelete = (task) => {
    const shouldDelete = window.confirm(
      `Are you sure you want to delete the task "${task.taskName}"?`
    );
    if (shouldDelete) {
      const updatedTasks = taskState.filter(
        (storedTask) => storedTask.id !== task.id
      );
      setTaskState(updatedTasks);
    }
  };

  return (
    <>
      {taskState &&
        (
          <tr key={taskState.id}>
            <td>
              {taskState.taskName}
              <button
                className="delete-button"
                title="Delete Task"
                onClick={() => handleTaskDelete(task)}
              >
                <i className="fas fa-trash" aria-hidden="true"></i>
              </button>
            </td>
            {datesAndDays.map((date, dayIndex) => (
              <td key={`${taskState.id}-${dayIndex}`}>
                {taskState.occurrences ? (
                  taskState.occurrences.map((occurrence) => {
                    return isSameDay(occurrence.date, date.date) ? (
                      <TaskCard
                        key={taskState.id}
                        taskId={taskState.id}
                        taskName={taskState.taskName}
                        data={occurrence}
                        type="occurrence"
                        handleTaskStatusChange={
                          handleTaskStatusChange
                        }
                      />
                    ) : null;
                  })
                ) : isSameDay(taskState.date, date.date) ? (
                  <TaskCard
                    key={taskState.id}
                    taskId={taskState.id}
                    taskName={taskState.taskName}
                    data={taskState}
                    type="task"
                    handleTaskStatusChange={handleTaskStatusChange}
                  />
                ) : null}
              </td>
            ))}
          </tr>
        )}
  {showModal &&
    <CommentModal
       showModal = {showModal}
       selectedTask = {selectedTask}
       handleCloseModal={handleCloseModal}
       handleSaveComment={handleSaveComment}
    />
  }
    </>
  );
};


export default Task;
