const mobileToggle = document.querySelector(".mobile-toggle");
const sidebarNav = document.querySelector(".sidebar-nav");
const hideSidebarBtn = document.querySelector(".hide-sidebar");
const openSidebarBtn = document.querySelector(".open-sidebar");
const lightDarkToggle = document.querySelector(".light-dark-toggle");

const mainContent = document.querySelector(".main-content");
const customizeBoard = document.querySelector(".customize-board");
const editBoardPopup = document.querySelector(".edit-board-popup");
const customizeTask = document.querySelector(".customize-task");
const editTaskPopup = document.querySelector(".edit-task-popup");

const controlPopupBtns = document.querySelectorAll(".control-popup-btn");
const popupCommons = document.querySelectorAll(".popup-common-styling");
const popupContents = document.querySelectorAll(".popup-content");
const cancelTargets = document.querySelectorAll(".cancel-target");

let boardLS = [];
let newBoardLS = [];
let outerFlag = false;
let changeableFlag = false;
let deleteableFlag = false;
let boardExistsFlag = false;
let boardDeleteableFlag = false;

const allBoards = document.querySelector(".all-boards");
const boardsCount = document.querySelector(".boards-count");

const statusColors = [
  "#49C4E5",
  "#8471F2",
  "#67E2AE",
  "#3498db",
  "#f1c40f",
  "#e67e22",
  "#7f8c8d",
  "#27ae60",
  "#8e44ad",
];

class Tasks {
  async tasksJson() {
    try {
      const tasks = await fetch("data.json");
      const data = await tasks.json();
      let boards = data.boards;

      boards = boards.map((board) => {
        const boardName = board.name;
        const boardColumnNames = board.columns.map((colName) => colName.name);
        const taskContainer = board.columns.map((column) => column.tasks);
        const taskTitles = taskContainer.map((task) => {
          return task.map((singleTask) => singleTask.title);
        });
        const taskDescs = taskContainer.map((task) => {
          return task.map((singleTask) => singleTask.description);
        });
        const taskStatuses = taskContainer.map((task) => {
          return task.map((singleTask) => singleTask.status);
        });
        const subtaskContainer = taskContainer.map((task) => {
          return task.map((singleTask) => singleTask.subtasks);
        });
        const subtaskTitles = subtaskContainer.map((subtask) => {
          return subtask.map((singleSubtask) =>
            singleSubtask.map((subtaskTitle) => subtaskTitle.title)
          );
        });
        const subtaskCompletion = subtaskContainer.map((subtask) => {
          return subtask.map((singleSubtask) =>
            singleSubtask.map((subtaskTitle) => subtaskTitle.isCompleted)
          );
        });

        return {
          boardName,
          boardColumnNames,
          taskTitles,
          taskDescs,
          taskStatuses,
          subtaskTitles,
          subtaskCompletion,
        };
      });
      return boards;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  // preventing to send submit event
  preventSubmitForm() {
    popupContents.forEach((content) => {
      content.addEventListener("submit", (e) => {
        e.preventDefault();
      });
    });
  }
  // function for closing mobile popup when not clicked
  closeMobilePopup() {
    window.addEventListener("click", (e) => {
      if (
        e.target === document.body ||
        e.target.classList.contains("customize-board") ||
        e.target.parentElement.classList.contains("customize-board")
      ) {
        sidebarNav.classList.remove("active");
        sidebarNav.classList.remove("shadow-bg");
      }
    });
  }
  // function for closing customibles popups when not clicked
  closeCustomizePopup() {
    const inputs = document.querySelectorAll(".view-task-popup input");
    const select = document.querySelector(".view-task-popup select");
    window.addEventListener("click", (e) => {
      if (
        e.target === document.body ||
        e.target.classList.contains("mobile-toggle") ||
        e.target.classList.contains("single-content") ||
        e.target.classList.contains("control-popup-btn")
      ) {
        editBoardPopup.classList.remove("visible");
        editTaskPopup.classList.remove("visible");
      }
      if (inputs.length > 0) {
        inputs.forEach((input) => {
          if (e.target === input || e.target === select) {
            editTaskPopup.classList.remove("visible");
          }
        });
      }
    });
  }
  // firing events when buttons clicked
  appClickables() {
    mobileToggle.addEventListener("click", () => {
      this.showSidebar("active");
      this.windowResize();
    });
    openSidebarBtn.addEventListener("click", () => {
      this.showSidebar("visible");
      Storage.setInfoLS("sidebar-visibility", "true");
    });
    hideSidebarBtn.addEventListener("click", this.hideSidebar);
    lightDarkToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode-enabled");
      this.lightDarkToggleStyle();
    });
    customizeBoard.addEventListener("click", () => {
      editBoardPopup.classList.toggle("visible");
      this.closeCustomizePopup();
    });
    customizeTask.addEventListener("click", () => {
      editTaskPopup.classList.toggle("visible");
      this.closeCustomizePopup();
    });
    this.cancelDelete();
    this.popupOpen();
  }
  showSidebar(action) {
    sidebarNav.classList.toggle(`${action}`);
    if (sidebarNav.classList.contains("active")) {
      sidebarNav.classList.toggle("shadow-bg");
      this.closeMobilePopup();
    } else {
      sidebarNav.classList.remove("shadow-bg");
    }
  }
  hideSidebar() {
    sidebarNav.classList.remove("visible");
    Storage.setInfoLS("sidebar-visibility", "false");
  }
  cancelDelete() {
    cancelTargets.forEach((target) => {
      target.addEventListener("click", () => {
        target.parentElement.parentElement.parentElement.parentElement.parentElement.dataset.editing =
          "false";
        target.parentElement.parentElement.parentElement.parentElement.parentElement.classList.remove(
          "shadow-bg"
        );
      });
    });
  }
  popupOpen() {
    controlPopupBtns.forEach((popupBtn) => {
      popupBtn.addEventListener("click", () => {
        const popupBtnControls = popupBtn.getAttribute("aria-controls");
        popupCommons.forEach((popup) => {
          if (popup.classList.contains(popupBtnControls)) {
            popup.dataset.editing = "true";
            popup.classList.add("shadow-bg");
            if (popup.classList.contains("add-task-popup")) {
              this.resetAddTaskInfo();
              this.addRemoveSubtask();
            } else if (popup.classList.contains("new-board-popup")) {
              this.resetNewBoardInfo();
              this.addRemoveSubtask();
            } else if (popup.classList.contains("edit-popup")) {
              this.resetEditBoardInfo();
              this.addRemoveSubtask();
            } else if (popupBtn.classList.contains("delete-board")) {
              boardDeleteableFlag = false;
            }
            this.popupClose(popup);
          } else {
            popup.dataset.editing = "false";
            popup.classList.remove("shadow-bg");
          }
        });
      });
    });
  }
  popupClose(popup) {
    const closeBtn = popup.querySelector(".save-column-target");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        const form = popup.querySelector(".popup-content");
        const formValidity = form.checkValidity();

        if (formValidity) {
          popup.dataset.editing = "false";
          popup.classList.remove("shadow-bg");
          if (closeBtn.textContent.trim() === "Create Task") {
            Storage.getBoardLS("new-board")
              ? (newBoardLS = Storage.getBoardLS("new-board"))
              : (newBoardLS = Storage.getBoardLS("board"));
            const activeBoard = Number(Storage.getInfoLS("active-board"));

            const newTaskTitle =
              document.querySelector(".add-task-title").value;
            const newTaskDesc = document.querySelector(
              ".add-task-popup textarea"
            ).value;
            const newTaskSubtasks = document.querySelectorAll(
              ".add-task-popup .board-info-columns-content input"
            );
            const selectValue = document.querySelector(
              ".add-task-popup select"
            ).value;

            newBoardLS[activeBoard].boardColumnNames.forEach(
              (boardName, index) => {
                if (
                  boardName === selectValue &&
                  !newBoardLS[activeBoard].taskTitles[index].includes(
                    newTaskTitle
                  )
                ) {
                  newBoardLS[activeBoard].taskTitles[index].push(newTaskTitle);
                  newBoardLS[activeBoard].taskStatuses[index].push(selectValue);
                  newBoardLS[activeBoard].taskDescs[index].push(newTaskDesc);
                  const subtaskLength =
                    newBoardLS[activeBoard].subtaskTitles[index].length;
                  newTaskSubtasks.forEach((subtask, ind) => {
                    if (ind === 0) {
                      newBoardLS[activeBoard].subtaskTitles[index].push([
                        subtask.value,
                      ]);
                      newBoardLS[activeBoard].subtaskCompletion[index].push([
                        false,
                      ]);
                    } else {
                      newBoardLS[activeBoard].subtaskTitles[index][
                        subtaskLength
                      ].push(subtask.value);
                      newBoardLS[activeBoard].subtaskCompletion[index][
                        subtaskLength
                      ].push(false);
                    }
                  });
                }
              }
            );
            Storage.setBoardLS(newBoardLS, "new-board");
          } else if (closeBtn.dataset.action === "new-board") {
            Storage.getBoardLS("new-board")
              ? (newBoardLS = Storage.getBoardLS("new-board"))
              : (newBoardLS = Storage.getBoardLS("board"));
            boardExistsFlag = false;

            let newBoardTitle = document.getElementById("new-board-name").value;
            newBoardTitle =
              newBoardTitle[0].toUpperCase() + newBoardTitle.slice(1);
            const newBoardSubtasks = document.querySelectorAll(
              ".new-board-popup .board-info-columns-content input"
            );

            newBoardLS.forEach((board) => {
              if (board.boardName === newBoardTitle) {
                boardExistsFlag = true;
              }
            });

            if (!boardExistsFlag) {
              const createdBoard = {
                boardName: newBoardTitle,
                boardColumnNames: [],
                subtaskCompletion: [],
                subtaskTitles: [],
                taskDescs: [],
                taskStatuses: [],
                taskTitles: [],
              };

              newBoardSubtasks.forEach((newCol, index) => {
                createdBoard.boardColumnNames.push(newCol.value);
                createdBoard.subtaskCompletion.push([]);
                createdBoard.subtaskTitles.push([]);
                createdBoard.taskDescs.push([]);
                createdBoard.taskStatuses.push([]);
                createdBoard.taskTitles.push([]);
              });

              newBoardLS.push(createdBoard);
              Storage.setBoardLS(newBoardLS, "new-board");
            }
          } else if (closeBtn.dataset.action === "edit-board") {
            Storage.getBoardLS("new-board")
              ? (newBoardLS = Storage.getBoardLS("new-board"))
              : (newBoardLS = Storage.getBoardLS("board"));
            const activeBoard = Number(Storage.getInfoLS("active-board"));

            let editBoardName =
              document.getElementById("edit-popup-name").value;
            editBoardName =
              editBoardName[0].toUpperCase() + editBoardName.slice(1);
            const editBoardColumnsInputs = document.querySelectorAll(
              ".edit-popup .board-info-columns-content input"
            );

            newBoardLS[activeBoard].boardName = editBoardName;
            editBoardColumnsInputs.forEach((colInput, index) => {
              colInput.value =
                colInput.value[0].toUpperCase() + colInput.value.slice(1);
              if (newBoardLS[activeBoard].boardColumnNames[index]) {
                if (
                  newBoardLS[activeBoard].boardColumnNames[index] !==
                  colInput.value
                ) {
                  newBoardLS[activeBoard].boardColumnNames[index] =
                    colInput.value;
                }
              } else {
                newBoardLS[activeBoard].boardColumnNames.push(colInput.value);
                newBoardLS[activeBoard].subtaskCompletion.push([]);
                newBoardLS[activeBoard].subtaskTitles.push([]);
                newBoardLS[activeBoard].taskDescs.push([]);
                newBoardLS[activeBoard].taskStatuses.push([]);
                newBoardLS[activeBoard].taskTitles.push([]);
              }

              newBoardLS[activeBoard].boardColumnNames.forEach(
                (colName, index) => {
                  if (!editBoardColumnsInputs[index]) {
                    newBoardLS[activeBoard].boardColumnNames.splice(index, 1);
                    newBoardLS[activeBoard].taskDescs.splice(index, 1);
                    newBoardLS[activeBoard].taskStatuses.splice(index, 1);
                    newBoardLS[activeBoard].taskTitles.splice(index, 1);
                    newBoardLS[activeBoard].subtaskCompletion.splice(index, 1);
                    newBoardLS[activeBoard].subtaskTitles.splice(index, 1);
                  } else if (colName !== editBoardColumnsInputs[index].value) {
                    newBoardLS[activeBoard].boardColumnNames.splice(index, 1);
                    newBoardLS[activeBoard].taskDescs.splice(index, 1);
                    newBoardLS[activeBoard].taskStatuses.splice(index, 1);
                    newBoardLS[activeBoard].taskTitles.splice(index, 1);
                    newBoardLS[activeBoard].subtaskCompletion.splice(index, 1);
                    newBoardLS[activeBoard].subtaskTitles.splice(index, 1);
                  }
                }
              );

              Storage.setBoardLS(newBoardLS, "new-board");
            });
          }
          // the function for saving info will be called
          this.setNewBoardLS();
          // izvuc newBoardLS iz LS pa koristit njega za populateBoards
          Storage.getBoardLS("new-board")
            ? (newBoardLS = Storage.getBoardLS("new-board"))
            : (newBoardLS = Storage.getBoardLS("board"));
          this.boardsReset();
          this.populateBoards(newBoardLS);
        } else {
          popup.dataset.editing = "true";
        }
      });
    }
    // close popup on outer click and do not save the info
    outerFlag = false;
    this.popupOuterClose();
  }
  // closing the popup on click out of popup(not saving the info osim kad je za view task popup)
  popupOuterClose() {
    window.addEventListener("click", (e) => {
      popupCommons.forEach((popup) => {
        if (popup.dataset.editing === "true") {
          if (e.target === document.body) {
            popup.setAttribute("data-editing", "false");
            popup.classList.remove("shadow-bg");
            if (outerFlag) {
              this.setNewBoardLS();
              // izvuc newBoardLS iz LS pa koristit njega za populateBoards
              newBoardLS = Storage.getBoardLS("new-board");
              this.boardsReset();
              this.populateBoards(newBoardLS);
            }
          }
        }
      });
    });
  }
  // setting the data when it is changed
  setNewBoardLS() {
    // declaring all needed info
    const taskLS = Storage.getTaskLS("single-task");
    const activeBoard = Number(Storage.getInfoLS("active-board"));
    Storage.getBoardLS("new-board")
      ? (newBoardLS = Storage.getBoardLS("new-board"))
      : (newBoardLS = Storage.getBoardLS("board"));
    const currentActiveBoard = newBoardLS[activeBoard];
    if (taskLS && !changeableFlag) {
      const colId = Number(taskLS.colId);
      const placeId = Number(taskLS.placeId);

      currentActiveBoard.subtaskCompletion[colId][placeId] =
        taskLS.singleSubtaskCompletion;
      currentActiveBoard.subtaskTitles[colId][placeId] = taskLS.singleSubtasks;
      currentActiveBoard.taskDescs[colId][placeId] = taskLS.singleDesc;
      currentActiveBoard.taskStatuses[colId][placeId] = taskLS.singleStatus;
      currentActiveBoard.taskTitles[colId][placeId] = taskLS.singleTitle;
      newBoardLS.forEach((savedBoard, index) => {
        if (index === activeBoard) {
          savedBoard = activeBoard;
        }
      });
      // saveat sveukupni newBoardLS u LS pa iz njega populatetat boardove
      Storage.setBoardLS(newBoardLS, "new-board");
      this.checkChangedStatus();
    }
  }
  // check if status changed and change the position of board
  checkChangedStatus() {
    const taskLS = Storage.getTaskLS("single-task");
    const activeBoard = Number(Storage.getInfoLS("active-board"));
    Storage.getBoardLS("new-board")
      ? (newBoardLS = Storage.getBoardLS("new-board"))
      : (newBoardLS = Storage.getBoardLS("board"));
    const currentActiveBoard = newBoardLS[activeBoard];
    const colId = Number(taskLS.colId);
    const placeId = Number(taskLS.placeId);
    if (
      currentActiveBoard.taskStatuses[colId][placeId] !==
        currentActiveBoard.boardColumnNames[colId] &&
      !changeableFlag
    ) {
      let removedTask = currentActiveBoard.taskTitles[colId].splice(placeId, 1);
      let removedDesc = currentActiveBoard.taskDescs[colId].splice(placeId, 1);
      let removedStatus = currentActiveBoard.taskStatuses[colId].splice(
        placeId,
        1
      );
      let removedSubtasks = currentActiveBoard.subtaskTitles[colId].splice(
        placeId,
        1
      );
      let removedCompletion = currentActiveBoard.subtaskCompletion[
        colId
      ].splice(placeId, 1);
      removedTask = removedTask[0];
      removedDesc = removedDesc[0];
      removedStatus = removedStatus[0];
      removedSubtasks = removedSubtasks[0];
      removedCompletion = removedCompletion[0];
      currentActiveBoard.boardColumnNames.forEach((colName, index) => {
        if (colName === taskLS.singleStatus) {
          currentActiveBoard.taskTitles[index].push(removedTask);
          currentActiveBoard.taskDescs[index].push(removedDesc);
          currentActiveBoard.taskStatuses[index].push(removedStatus);
          currentActiveBoard.subtaskTitles[index].push(removedSubtasks);
          currentActiveBoard.subtaskCompletion[index].push(removedCompletion);
        }
      });
    }
    changeableFlag = true;
    Storage.setBoardLS(newBoardLS, "new-board");
  }
  // function for dark mode functionality
  lightDarkToggleStyle() {
    const logoImg = document.querySelector(".logo-img-toggle");
    const span = lightDarkToggle.querySelector(".light-dark-icon");
    if (document.body.classList.contains("dark-mode-enabled")) {
      span.style.left = "50%";
      logoImg.srcset = "./assets/logo-light.svg";
      Storage.addDarkEnabled();
    } else {
      span.style.left = "0%";
      logoImg.srcset = "./assets/logo-dark.svg";
      Storage.removeDarkEnabled();
    }
    span.style.transition = "left 350ms ease";
  }
  // closing sidebar popup from small screen
  windowResize() {
    window.addEventListener("resize", (e) => {
      const windowWidth = window.innerWidth;
      if (windowWidth > 720) {
        sidebarNav.classList.remove("active");
        sidebarNav.classList.remove("shadow-bg");
      }
    });
  }
  // checking LS to provide correct UI
  checkLS() {
    const darkEnabled = Storage.getInfoLS("dark-mode");
    const sidebarState = Storage.getInfoLS("sidebar-visibility");
    darkEnabled === "true"
      ? document.body.classList.add("dark-mode-enabled")
      : document.body.classList.remove("dark-mode-enabled");
    sidebarState === "true"
      ? sidebarNav.classList.add("visible")
      : sidebarNav.classList.remove("visible");
  }
  // providing needed data on load
  setupApp() {
    this.checkLS();
    this.lightDarkToggleStyle();
    this.appClickables();
  }
  // functions for dragging elements
  dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.id);
    setTimeout(() => {
      e.target.classList.add("hide-el");
    }, 0);
    // changing the LS
    Storage.getBoardLS("new-board")
      ? (newBoardLS = Storage.getBoardLS("new-board"))
      : (newBoardLS = Storage.getBoardLS("board"));
    const activeBoard = Number(Storage.getInfoLS("active-board"));

    const colId = Number(e.target.id.slice(-3, -2));
    const placeId = Number(e.target.id.slice(-1));

    let splicedTitle = newBoardLS[activeBoard].taskTitles[colId].splice(
      placeId,
      1
    );
    splicedTitle = splicedTitle[0];
    let splicedDesc = newBoardLS[activeBoard].taskDescs[colId].splice(
      placeId,
      1
    );
    splicedDesc = splicedDesc[0];
    let splicedStatus = newBoardLS[activeBoard].taskStatuses[colId].splice(
      placeId,
      1
    );
    splicedStatus = splicedStatus[0];
    let splicedSubtask = newBoardLS[activeBoard].subtaskTitles[colId].splice(
      placeId,
      1
    );
    splicedSubtask = splicedSubtask[0];
    let splicedSubtaskStatuses = newBoardLS[activeBoard].subtaskCompletion[
      colId
    ].splice(placeId, 1);
    splicedSubtaskStatuses = splicedSubtaskStatuses[0];

    const splicedData = {
      splicedTitle,
      splicedDesc,
      splicedStatus,
      splicedSubtask,
      splicedSubtaskStatuses,
    };

    Storage.setTaskLS("dragged-task", splicedData);
    Storage.setBoardLS(newBoardLS, "new-board");
  }
  dragEnter(e) {
    e.preventDefault();
    e.target.classList.add("drag-over");
  }
  dragOver(e) {
    e.preventDefault();
    e.target.classList.add("drag-over");
  }
  dragLeave(e) {
    e.target.classList.remove("drag-over");
  }
  dragEnd(e) {
    if (e.dataTransfer.dropEffect === "none") {
      const draggedTask = Storage.getTaskLS("dragged-task");
      Storage.getBoardLS("new-board")
        ? (newBoardLS = Storage.getBoardLS("new-board"))
        : (newBoardLS = Storage.getBoardLS("board"));
      const activeBoard = Number(Storage.getInfoLS("active-board"));
      const colId = Number(e.target.id.slice(-3, -2));
      const placeId = Number(e.target.id.slice(-1));

      newBoardLS[activeBoard].taskTitles[colId].splice(
        placeId,
        0,
        draggedTask.splicedTitle
      );
      newBoardLS[activeBoard].taskDescs[colId].splice(
        placeId,
        0,
        draggedTask.splicedDesc
      );
      newBoardLS[activeBoard].taskStatuses[colId].splice(
        placeId,
        0,
        newBoardLS[activeBoard].boardColumnNames[colId]
      );
      newBoardLS[activeBoard].subtaskTitles[colId].splice(
        placeId,
        0,
        draggedTask.splicedSubtask
      );
      newBoardLS[activeBoard].subtaskCompletion[colId].splice(
        placeId,
        0,
        draggedTask.splicedSubtaskStatuses
      );

      e.target.classList.remove("hide-el");
      Storage.setBoardLS(newBoardLS, "new-board");
    }
  }
  drop(e) {
    function dropOnPlace(colId, placeId) {
      newBoardLS[activeBoard].taskTitles[colId].splice(
        placeId,
        0,
        draggedTask.splicedTitle
      );
      newBoardLS[activeBoard].taskDescs[colId].splice(
        placeId,
        0,
        draggedTask.splicedDesc
      );
      newBoardLS[activeBoard].taskStatuses[colId].splice(
        placeId,
        0,
        newBoardLS[activeBoard].boardColumnNames[colId]
      );
      newBoardLS[activeBoard].subtaskTitles[colId].splice(
        placeId,
        0,
        draggedTask.splicedSubtask
      );
      newBoardLS[activeBoard].subtaskCompletion[colId].splice(
        placeId,
        0,
        draggedTask.splicedSubtaskStatuses
      );
    }
    e.target.classList.remove("drag-over");

    const id = e.dataTransfer.getData("text/plain");
    const draggable = document.getElementById(id);

    const draggedTask = Storage.getTaskLS("dragged-task");
    Storage.getBoardLS("new-board")
      ? (newBoardLS = Storage.getBoardLS("new-board"))
      : (newBoardLS = Storage.getBoardLS("board"));
    const activeBoard = Number(Storage.getInfoLS("active-board"));

    if (e.target.classList.contains("task-popup-btn")) {
      const colId = Number(e.target.id.slice(-3, -2));
      const placeId = Number(e.target.id.slice(-1));
      dropOnPlace(colId, placeId);

      e.target.parentElement.appendChild(draggable);
    } else if (
      e.target.classList.contains("single-content-title") ||
      e.target.classList.contains("single-content-subtasks-status")
    ) {
      const colId = Number(e.target.parentElement.id.slice(-3, -2));
      const placeId = Number(e.target.parentElement.id.slice(-1));
      dropOnPlace(colId, placeId);

      e.target.parentElement.parentElement.appendChild(draggable);
    } else {
      const colId = Number(e.target.children[0].id.slice(-3, -2));
      const placeId = 0;
      dropOnPlace(colId, placeId);

      e.target.appendChild(draggable);
    }

    draggable.classList.remove("hide-el");
    // set boardLS for changed data
    Storage.setBoardLS(newBoardLS, "new-board");
  }
  // opening the view task popup when content is pushed and using drag events
  taskPopupOpen() {
    const taskPopupBtns = document.querySelectorAll(".task-popup-btn");
    const viewTaskPopup = document.querySelector(".view-task-popup");

    const boardColumns = document.querySelectorAll(
      ".board-columns .board-content-column .column-content"
    );

    // drag events
    boardColumns.forEach((boardCol) => {
      boardCol.addEventListener("dragenter", this.dragEnter);
      boardCol.addEventListener("dragover", this.dragOver);
      boardCol.addEventListener("dragleave", this.dragLeave);
      boardCol.addEventListener("drop", this.drop);
      // drop event but populating boards when that happens
      boardCol.addEventListener("drop", () => {
        // get changed boardLS and populate boards
        Storage.getBoardLS("new-board")
          ? (newBoardLS = Storage.getBoardLS("new-board"))
          : (newBoardLS = Storage.getBoardLS("board"));
        this.boardsReset();
        this.populateBoards(newBoardLS);
      });
    });

    taskPopupBtns.forEach((popupBtn) => {
      popupBtn.addEventListener("dragstart", this.dragStart);
      popupBtn.addEventListener("dragend", this.dragEnd);
      popupBtn.addEventListener("click", () => {
        this.viewTaskInfo(popupBtn);
        viewTaskPopup.dataset.editing = "true";
        viewTaskPopup.classList.add("shadow-bg");
        // informations will be saved with this exit as well
        this.popupOuterClose();
      });
    });
  }
  // decorating view task popup by need
  viewTaskInfo(popupBtn) {
    changeableFlag = false;
    deleteableFlag = false;
    Storage.getBoardLS("new-board")
      ? (newBoardLS = Storage.getBoardLS("new-board"))
      : (newBoardLS = Storage.getBoardLS("board"));
    // declaring needed variables
    const activeBoard = Number(Storage.getInfoLS("active-board"));
    const boardData = newBoardLS[activeBoard];
    const viewTaskPopup = document.querySelector(".view-task-popup");
    const taskTitle = viewTaskPopup.querySelector("h2");
    const taskDesc = viewTaskPopup.querySelector(".task-description");
    const taskOption = viewTaskPopup.querySelector("option");
    const columnId = popupBtn.dataset.column;
    const id = popupBtn.dataset.id;

    // extracting info from LS and providing it to popup
    const singleTaskInfo = newBoardLS.map((task) => {
      const colId = columnId;
      const placeId = id;
      if (task.taskTitles[columnId]) {
        const singleTitle = task.taskTitles[columnId][id];
        const singleDesc = task.taskDescs[columnId][id];
        const singleStatus = task.taskStatuses[columnId][id];
        const singleSubtasks = task.subtaskTitles[columnId][id];
        const singleSubtaskCompletion = task.subtaskCompletion[columnId][id];
        return {
          colId,
          placeId,
          singleTitle,
          singleDesc,
          singleStatus,
          singleSubtasks,
          singleSubtaskCompletion,
        };
      }
    });
    Storage.setTaskLS("single-task", singleTaskInfo[activeBoard]);

    taskTitle.textContent = singleTaskInfo[activeBoard].singleTitle;
    taskDesc.textContent = singleTaskInfo[activeBoard].singleDesc;
    this.setSubtasks();
    taskOption.textContent = boardData.boardColumnNames[columnId];
    taskOption.value = boardData.boardColumnNames[columnId];

    this.editTaskInfo(singleTaskInfo);
    this.deleteTask();
  }
  setSubtasks() {
    const taskLS = Storage.getTaskLS("single-task");
    const viewTaskPopup = document.querySelector(".view-task-popup");
    const subtaskStatus = viewTaskPopup.querySelector(".subtasks-status");
    const subtasksWrapper = viewTaskPopup.querySelector(".board-info-columns");
    subtasksWrapper.innerHTML = "";

    const taskSubtasks = taskLS.singleSubtaskCompletion;
    const completedSubtasks = taskSubtasks.filter((status) => {
      if (status === true) {
        return status;
      }
      return;
    });

    subtaskStatus.textContent = `Subtasks (${completedSubtasks.length} of ${taskSubtasks.length})`;
    for (let i = 0; i < taskSubtasks.length; i++) {
      const subtaskCont = taskLS.singleSubtasks[i];
      const subtaskTrue = taskLS.singleSubtaskCompletion[i];

      const div = document.createElement("div");
      div.classList.add("board-info-columns-content");
      div.innerHTML = `
        <input type="checkbox" name="view-subtask-${i}" id="board-info-view-subtask-${i}" required>
        <label for="board-info-view-subtask-${i}">
          ${subtaskCont}
        </label>
      `;
      if (subtaskTrue) {
        const inputCheck = div.querySelector("input");
        inputCheck.checked = true;
      }
      subtasksWrapper.appendChild(div);
    }
    this.changeChecked(subtasksWrapper);
  }
  // changing checked state of input
  changeChecked(wrapper) {
    let taskLS = Storage.getTaskLS("single-task");
    const columnsContentCheckbox = wrapper.querySelectorAll(
      ".board-info-columns-content input[type=checkbox]"
    );
    columnsContentCheckbox.forEach((colInput, index) => {
      colInput.addEventListener("click", () => {
        taskLS = Storage.getTaskLS("single-task");
        if (taskLS.singleSubtaskCompletion[index] === true) {
          taskLS.singleSubtaskCompletion[index] = false;
        } else {
          taskLS.singleSubtaskCompletion[index] = true;
        }
        Storage.setTaskLS("single-task", taskLS);
      });
      outerFlag = true;
    });
  }
  // decorating view single task popup by need
  editTaskInfo(taskInfo) {
    Storage.getBoardLS("new-board")
      ? (newBoardLS = Storage.getBoardLS("new-board"))
      : (newBoardLS = Storage.getBoardLS("board"));
    const activeBoard = Number(Storage.getInfoLS("active-board"));
    const editTaskTitle = document.querySelector(".title-value");
    editTaskTitle.value = taskInfo[activeBoard].singleTitle;
    const editTaskDesc = document.querySelector(".old-desc");
    editTaskDesc.value = taskInfo[activeBoard].singleDesc;
    const editTaskColumns = document.querySelector(
      ".edit-single-task-popup .board-info-columns"
    );
    editTaskColumns.innerHTML = "";
    taskInfo[activeBoard].singleSubtasks.forEach((subtask, index) => {
      const div = document.createElement("div");
      div.classList.add("board-info-columns-content");
      div.innerHTML = `
        <input type="text" name="edit-subtask-${index}" id="board-info-edit-subtask-${index}" value="${subtask}" required>
        <label for="board-info-edit-subtask-${index}">
          <button type="button" class="remove-subtask">
            <img src="./assets/icon-cross.svg" alt="">
          </button>
        </label>
      `;
      editTaskColumns.appendChild(div);
    });
    this.addRemoveSubtask();
    const editTaskSelect = document.querySelector(
      ".edit-single-task-popup select"
    );
    editTaskSelect.innerHTML = "";
    for (let i = 0; i < newBoardLS[activeBoard].boardColumnNames.length; i++) {
      const editStatus = newBoardLS[activeBoard].boardColumnNames[i];
      editTaskSelect.innerHTML += `
        <option value="${editStatus}">${editStatus}</option>
      `;
    }
    const editTaskOptions = document.querySelectorAll(
      ".edit-single-task-popup option"
    );
    editTaskOptions.forEach((option) => {
      option.textContent === taskInfo[activeBoard].singleStatus
        ? (option.selected = true)
        : (option.selected = false);
    });
    this.changeEditTask();
  }
  // change edit task content
  changeEditTask() {
    let taskLS = Storage.getTaskLS("single-task");
    const wrapperSelect = document.querySelector(
      ".edit-single-task-popup select"
    );
    const saveColumnTarget = document.querySelector(
      ".edit-single-task-popup .save-column-target"
    );
    const editTaskTitle = document.querySelector(".title-value");
    const editTaskDesc = document.querySelector(".old-desc");
    wrapperSelect.addEventListener("change", () => {
      taskLS = Storage.getTaskLS("single-task");
      taskLS.singleStatus = wrapperSelect.value;
      Storage.setTaskLS("single-task", taskLS);
    });
    saveColumnTarget.addEventListener("click", () => {
      taskLS = Storage.getTaskLS("single-task");
      const editTaskInputs = document.querySelectorAll(
        ".edit-single-task-popup .board-info-columns-content input"
      );

      taskLS.singleTitle = editTaskTitle.value;
      taskLS.singleDesc = editTaskDesc.value;
      editTaskInputs.forEach((subtask, index) => {
        if (editTaskInputs.length > taskLS.singleSubtasks.length) {
          taskLS.singleSubtasks[index] = subtask.value;
          if (taskLS.singleSubtaskCompletion[index] === undefined) {
            taskLS.singleSubtaskCompletion[index] = false;
          }
        }
      });
      Storage.setTaskLS("single-task", taskLS);
    });
  }
  // adding functionality to add new subtask in popups
  addRemoveSubtask() {
    let taskLS = Storage.getTaskLS("single-task");
    // declaring for edit subtasks
    const editTaskColumns = document.querySelector(
      ".edit-single-task-popup .board-info-columns"
    );
    const editSubtasksBtn = document.querySelector(
      ".edit-single-subtask-target"
    );

    editSubtasksBtn.addEventListener("click", () => {
      const editTaskInputs = document.querySelectorAll(
        ".edit-single-task-popup .board-info-columns-content input"
      );
      const index = editTaskInputs.length;
      editTaskInputs.forEach((inputField, ind) => {
        if (inputField.value !== "" && ind === index - 1) {
          const div = document.createElement("div");
          div.classList.add("board-info-columns-content");
          div.innerHTML = `
              <input type="text" name="edit-subtask-${index}" id="board-info-edit-subtask-${index}" value="" required>
              <label for="board-info-edit-subtask-${index}">
                <button type="button" class="remove-subtask">
                  <img src="./assets/icon-cross.svg" alt="">
                </button>
              </label>
            `;
          editTaskColumns.appendChild(div);
        }
      });
    });

    const removeSubtasks = document.querySelectorAll(
      ".edit-single-task-popup .remove-subtask"
    );
    removeSubtasks.forEach((removeBtn, index) => {
      removeBtn.addEventListener("click", () => {
        taskLS = Storage.getTaskLS("single-task");
        editTaskColumns.removeChild(removeBtn.parentElement.parentElement);
        taskLS.singleSubtaskCompletion.splice(index, 1);
        taskLS.singleSubtasks.splice(index, 1);

        Storage.setTaskLS("single-task", taskLS);
      });
    });
    // declaring for adding task
    const addTaskColumns = document.querySelector(
      ".add-task-popup .board-info-columns"
    );
    const addSubtasksBtn = document.querySelector(".add-subtask-target");

    addSubtasksBtn.addEventListener("click", () => {
      const addTaskInputs = document.querySelectorAll(
        ".add-task-popup .board-info-columns-content input"
      );
      const index = addTaskInputs.length;
      addTaskInputs.forEach((inputField, ind) => {
        if (inputField.value !== "" && ind === index - 1) {
          const div = document.createElement("div");
          div.classList.add("board-info-columns-content");
          div.innerHTML = `
              <input type="text" name="subtask-${index}" id="board-info-subtask-${index}" placeholder="e.g. Make coffee" required>
              <label for="board-info-subtask-${index}">
                <button type="button" class="remove-subtask">
                  <img src="./assets/icon-cross.svg" alt="">
                </button>
              </label>
            `;
          addTaskColumns.appendChild(div);
        }
      });
    });

    const cancelSubtaskAdded = document.querySelectorAll(
      ".add-task-popup .remove-subtask"
    );
    cancelSubtaskAdded.forEach((cancelBtn, index) => {
      cancelBtn.addEventListener("click", () => {
        addTaskColumns.removeChild(cancelBtn.parentElement.parentElement);
      });
    });

    // declaring for creating board
    const createBoardColumns = document.querySelector(
      ".new-board-popup .board-info-columns"
    );
    const createColumnBtn = document.querySelector(".add-new-column-target");

    createColumnBtn.addEventListener("click", () => {
      const boardColumns = document.querySelectorAll(
        ".new-board-popup .board-info-columns-content input"
      );
      const index = boardColumns.length;
      boardColumns.forEach((inputField, ind) => {
        if (inputField.value !== "" && ind === index - 1) {
          const div = document.createElement("div");
          div.classList.add("board-info-columns-content");
          div.innerHTML = `
              <input type="text" name="column-${index}" id="new-column-${index}" required>
              <label for="new-column-${index}">
                <button type="button" class="remove-subtask">
                  <img src="./assets/icon-cross.svg" alt="">
                </button>
              </label>
            `;
          createBoardColumns.appendChild(div);
        }
      });
    });

    const cancelColumnAdded = document.querySelectorAll(
      ".new-board-popup .remove-subtask"
    );
    cancelColumnAdded.forEach((cancelBtn, index) => {
      cancelBtn.addEventListener("click", () => {
        createBoardColumns.removeChild(cancelBtn.parentElement.parentElement);
      });
    });

    // declaring for edit board
    const editBoardColumns = document.querySelector(
      ".edit-popup .board-info-columns"
    );
    const addColumnBtn = document.querySelector(".add-column-target");

    addColumnBtn.addEventListener("click", () => {
      const editBoardColumnsInputs = document.querySelectorAll(
        ".edit-popup .board-info-columns-content input"
      );
      const index = editBoardColumnsInputs.length;
      editBoardColumnsInputs.forEach((inputField, ind) => {
        if (inputField.value !== "" && ind === index - 1) {
          const div = document.createElement("div");
          div.classList.add("board-info-columns-content");
          div.innerHTML = `
            <input type="text" name="edit-column-${index}" id="board-info-column-${index}" required>
            <label for="board-info-column-${index}">
              <button type="button" class="remove-subtask">
                <img src="./assets/icon-cross.svg" alt="">
              </button>
            </label>
            `;
          editBoardColumns.appendChild(div);
        }
      });
    });

    const cancelEditColumn = document.querySelectorAll(
      ".edit-popup .remove-subtask"
    );
    cancelEditColumn.forEach((cancelBtn, index) => {
      cancelBtn.addEventListener("click", () => {
        editBoardColumns.removeChild(cancelBtn.parentElement.parentElement);
      });
    });
  }

  // reset previous info when add new task is clicked
  resetAddTaskInfo() {
    Storage.getBoardLS("new-board")
      ? (newBoardLS = Storage.getBoardLS("new-board"))
      : (newBoardLS = Storage.getBoardLS("board"));
    const activeBoard = Number(Storage.getInfoLS("active-board"));

    const newTaskTitle = document.querySelector(".add-task-title");
    const newTaskDesc = document.querySelector(".add-task-popup textarea");
    const newTaskColumns = document.querySelector(
      ".add-task-popup .board-info-columns"
    );
    const newTaskSubtasks = document.querySelectorAll(
      ".add-task-popup .board-info-columns-content input"
    );
    const newTaskSelect = document.querySelector(".add-task-popup select");

    newTaskTitle.value = "";
    newTaskDesc.value = "";
    newTaskSubtasks.forEach((subtask) => {
      if (subtask.id.slice(-1) !== "0") {
        newTaskColumns.removeChild(subtask.parentElement);
      } else {
        subtask.value = "";
      }
    });
    newTaskSelect.textContent = "";
    newBoardLS[activeBoard].boardColumnNames.forEach((colName) => {
      const option = document.createElement("option");
      option.textContent = colName;
      option.value = colName;
      newTaskSelect.appendChild(option);
    });
  }
  // reset previous info when create new board clicked
  resetNewBoardInfo() {
    const newBoardName = document.getElementById("new-board-name");
    const newBoardColumns = document.querySelector(
      ".new-board-popup .board-info-columns"
    );
    const newBoardSubtasks = document.querySelectorAll(
      ".new-board-popup .board-info-columns-content input"
    );

    newBoardName.value = "";
    newBoardSubtasks.forEach((subtask) => {
      if (subtask.id.slice(-1) !== "0") {
        newBoardColumns.removeChild(subtask.parentElement);
      } else {
        subtask.value = "";
      }
    });
  }
  // reset previous info when edit board clicked
  resetEditBoardInfo() {
    Storage.getBoardLS("new-board")
      ? (newBoardLS = Storage.getBoardLS("new-board"))
      : (newBoardLS = Storage.getBoardLS("board"));
    const activeBoard = Number(Storage.getInfoLS("active-board"));

    const editBoardName = document.getElementById("edit-popup-name");
    const editBoardColumns = document.querySelector(
      ".edit-popup .board-info-columns"
    );
    editBoardColumns.textContent = "";

    editBoardName.value = newBoardLS[activeBoard].boardName;
    newBoardLS[activeBoard].boardColumnNames.forEach((colName, index) => {
      const div = document.createElement("div");
      div.classList.add("board-info-columns-content");
      div.innerHTML += `
        <input type="text" value="${colName}" name="edit-column-${index}" id="board-info-column-${index}" required>
        <label for="board-info-column-${index}">
          <button type="button" class="remove-subtask">
            <img src="./assets/icon-cross.svg" alt="">
          </button>
        </label>
      `;
      editBoardColumns.appendChild(div);
    });
  }
  // when delete task popup is opened
  deleteTask() {
    let taskLS = Storage.getTaskLS("single-task");
    const delTaskPopup = document.querySelector(".delete-task-popup");
    const delTaskSpan = document.querySelector(".delete-task-popup span");
    delTaskSpan.textContent = taskLS.singleTitle;
    const delTask = document.querySelector(".delete-task-target");

    delTask.addEventListener("click", () => {
      taskLS = Storage.getTaskLS("single-task");
      const activeBoard = Number(Storage.getInfoLS("active-board"));
      Storage.getBoardLS("new-board")
        ? (newBoardLS = Storage.getBoardLS("new-board"))
        : (newBoardLS = Storage.getBoardLS("board"));
      const currentActiveBoard = newBoardLS[activeBoard];
      const colId = Number(taskLS.colId);
      const placeId = Number(taskLS.placeId);

      if (!deleteableFlag) {
        currentActiveBoard.taskTitles[colId].splice(placeId, 1);
        currentActiveBoard.taskDescs[colId].splice(placeId, 1);
        currentActiveBoard.taskStatuses[colId].splice(placeId, 1);
        currentActiveBoard.subtaskTitles[colId].splice(placeId, 1);
        currentActiveBoard.subtaskCompletion[colId].splice(placeId, 1);

        deleteableFlag = true;

        Storage.setBoardLS(newBoardLS, "new-board");

        delTaskPopup.dataset.editing = "false";
        delTaskPopup.classList.remove("shadow-bg");
        newBoardLS = Storage.getBoardLS("new-board");
        this.boardsReset();
        this.populateBoards(newBoardLS);
      }
    });
  }
  // when delete board popup is opened
  deleteBoard() {
    const activeBoard = Number(Storage.getInfoLS("active-board"));
    Storage.getBoardLS("new-board")
      ? (newBoardLS = Storage.getBoardLS("new-board"))
      : (newBoardLS = Storage.getBoardLS("board"));
    const delBoardPopup = document.querySelector(".delete-board-popup");
    const delBoard = document.querySelector(".delete-board-target");

    delBoard.addEventListener("click", () => {
      if (!boardDeleteableFlag) {
        const activeBoard = Number(Storage.getInfoLS("active-board"));

        newBoardLS.splice(activeBoard, 1);
        Storage.setBoardLS(newBoardLS, "new-board");
        if (activeBoard > 0) {
          Storage.setInfoLS("active-board", activeBoard - 1);
          this.checkIfBoardsExist();
        } else {
          Storage.setInfoLS("active-board", activeBoard);
          this.checkIfBoardsExist();
        }
        boardDeleteableFlag = true;

        delBoardPopup.dataset.editing = "false";
        delBoardPopup.classList.remove("shadow-bg");
        newBoardLS = Storage.getBoardLS("new-board");
        this.boardsReset();
        this.populateBoards(newBoardLS);
      }
    });
  }
  // function for checking if there are boards made
  checkIfBoardsExist() {
    Storage.getBoardLS("new-board")
      ? (newBoardLS = Storage.getBoardLS("new-board"))
      : (newBoardLS = Storage.getBoardLS("board"));

    if (newBoardLS.length > 0) {
      mainContent.dataset.empty = false;
    } else {
      mainContent.dataset.empty = true;
    }
  }
  // function for setting boards and calling a function to set board data
  populateBoards(boards) {
    boards.forEach((board, index) => {
      allBoards.innerHTML += `
      <button class="board board-btn" aria-controls="board-content">
        <img src="./assets/icon-board.svg" alt="">
        ${board.boardName}
      </button>
      `;
      this.checkIfBoardsExist();
      this.setActiveBoard();
      this.activeBoardFunctionality(index);
      this.deleteBoard();
    });
    boardsCount.textContent = boards.length;
  }
  // reseting boards content for new load
  boardsReset() {
    allBoards.innerHTML = "";
    this.resetBoardContent();
  }
  // setting active board from LS and on click events
  setActiveBoard() {
    const activeBoard = Number(Storage.getInfoLS("active-board"));

    const btns = document.querySelectorAll(".board-btn");
    btns.forEach((btn, index) => {
      activeBoard === index ? btn.classList.add("active") : null;
      btn.addEventListener("click", () => {
        btns.forEach((el) => {
          el.classList.remove("active");
          this.resetBoardContent();
        });
        btn.classList.add("active");
        Storage.setInfoLS("active-board", index);
        this.activeBoardFunctionality(index);
      });
    });
  }
  // calling to populate content for each active board
  activeBoardFunctionality(index) {
    let activeBoard = Number(Storage.getInfoLS("active-board"));
    if (!activeBoard) {
      // za ovu funkcionalnost umisto da je activeBoard = 0, stavit da ne postoji nego da se pokazuje empty content
      activeBoard = 0;
    }
    Storage.getBoardLS("new-board")
      ? (newBoardLS = Storage.getBoardLS("new-board"))
      : (newBoardLS = Storage.getBoardLS("board"));

    if (activeBoard === index) {
      const delBoardSpan = document.querySelector(".board-title");
      delBoardSpan.textContent = newBoardLS[activeBoard].boardName;

      const boardColumnsAmount = newBoardLS[index].boardColumnNames.length;
      for (let i = 0; i < boardColumnsAmount; i++) {
        this.populateTasks(i);
      }
      this.taskPopupOpen();
    }
  }
  // reseting main content
  resetBoardContent() {
    const boardColumns = document.querySelectorAll(".board-columns");
    boardColumns.forEach((boardCol) => {
      boardCol.innerHTML = "";
    });
  }
  // populating main content with data when called by active board
  populateTasks(i) {
    const activeBoard = Number(Storage.getInfoLS("active-board"));
    const boardColumns = document.querySelector(".board-columns");

    // setting the content div
    const div = document.createElement("div");
    div.classList.add("board-content-column");
    div.innerHTML = `
        <h2 class="column-status">${newBoardLS[activeBoard].boardColumnNames[i]} (${newBoardLS[activeBoard].taskTitles[i].length})</h2>
        <div class="column-content">
          
        </div>
      `;
    div.style.setProperty("--_status-color", statusColors[i]);
    boardColumns.appendChild(div);

    // extracting the column area for each div and populating it
    const columnContent = div.querySelector(".column-content");
    const titlesAmount = newBoardLS[activeBoard].taskTitles[i].length;

    for (let j = 0; j < titlesAmount; j++) {
      const taskTitle = newBoardLS[activeBoard].taskTitles[i][j];
      const taskSubtasks = newBoardLS[activeBoard].subtaskCompletion[i][j];
      const completedSubtasks = taskSubtasks.filter((status) => {
        if (status === true) {
          return status;
        }
        return;
      });
      columnContent.innerHTML += `
        <button class="single-content task-popup-btn" id="single-content-${activeBoard}-${i}-${j}" aria-controls="view-task-popup" draggable="true" data-column=${i} data-id=${j}>
          <h3 class="single-content-title">${taskTitle}</h3>
          <p class="single-content-subtasks-status">${completedSubtasks.length} of ${taskSubtasks.length} subtasks</p>
        </button>
      `;
    }
  }
}

class Storage {
  // get and set info LS
  static getInfoLS(item) {
    return localStorage.getItem(`${item}`);
  }
  static setInfoLS(item, action) {
    localStorage.setItem(`${item}`, `${action}`);
  }
  // dark/light toggle methods
  static addDarkEnabled() {
    lightDarkToggle.children[0].textContent = "dark mode";
    lightDarkToggle.dataset.mode = "dark mode";
    localStorage.setItem("dark-mode", true);
  }
  static removeDarkEnabled() {
    lightDarkToggle.children[0].textContent = "light mode";
    lightDarkToggle.dataset.mode = "light mode";
    localStorage.setItem("dark-mode", false);
  }
  // set board to LS
  static setBoardLS(board, boardName) {
    localStorage.setItem(`${boardName}`, JSON.stringify(board));
  }
  static getBoardLS(board) {
    return JSON.parse(localStorage.getItem(`${board}`));
  }
  // single task LS
  static setTaskLS(saveItem, singleTask) {
    localStorage.setItem(`${saveItem}`, JSON.stringify(singleTask));
  }
  static getTaskLS(extractItem) {
    return JSON.parse(localStorage.getItem(`${extractItem}`));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const tasks = new Tasks();
  const ui = new UI();

  ui.setupApp();

  tasks.tasksJson().then((boards) => {
    Storage.setBoardLS(boards, "board");
    Storage.getBoardLS("new-board")
      ? (newBoardLS = Storage.getBoardLS("new-board"))
      : (newBoardLS = Storage.getBoardLS("board"));
    ui.populateBoards(newBoardLS);
  });

  ui.preventSubmitForm();
});
