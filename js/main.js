const mobileToggle = document.querySelector(".mobile-toggle");
const sidebarNav = document.querySelector(".sidebar-nav");
const hideSidebarBtn = document.querySelector(".hide-sidebar");
const openSidebarBtn = document.querySelector(".open-sidebar");
const lightDarkToggle = document.querySelector(".light-dark-toggle");

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

const allBoards = document.querySelector(".all-boards");
const boardsCount = document.querySelector(".boards-count");

const statusColors = ["#49C4E5", "#8471F2", "#67E2AE"];

function preventSubmitForm() {
  popupContents.forEach((content) => {
    content.addEventListener("submit", (e) => {
      e.preventDefault();
    });
  });
}

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
    });
    customizeTask.addEventListener("click", () => {
      editTaskPopup.classList.toggle("visible");
    });
    this.cancelDelete();
    this.popupOpen();
  }
  showSidebar(action) {
    sidebarNav.classList.toggle(`${action}`);
    if (sidebarNav.classList.contains("active")) {
      sidebarNav.classList.toggle("shadow-bg");
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
        console.log(
          target.parentElement.parentElement.parentElement.parentElement
            .parentElement
        );
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
              this.addTaskInfo();
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
                if (boardName === selectValue) {
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
    if (taskLS) {
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
  // opening the view task popup when content is pushed
  taskPopupOpen() {
    const taskPopupBtns = document.querySelectorAll(".task-popup-btn");
    const viewTaskPopup = document.querySelector(".view-task-popup");

    taskPopupBtns.forEach((popupBtn) => {
      popupBtn.addEventListener("click", () => {
        this.viewTaskInfo(popupBtn);
        viewTaskPopup.dataset.editing = "true";
        viewTaskPopup.classList.add("shadow-bg");
        // informations will be saved with this exit as well
        this.popupOuterClose();
      });
    });
  }
  // add task popup
  addTaskInfo() {
    this.addRemoveSubtask();
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
  // adding functionality to add new subtask in edit task popup
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
      const editTaskInputsLength = document.querySelectorAll(
        ".edit-single-task-popup .board-info-columns-content input"
      ).length;
      const index = editTaskInputsLength;
      const subtaskIndex = taskLS.singleSubtaskCompletion.length;
      if (index === subtaskIndex) {
        const div = document.createElement("div");
        div.classList.add("board-info-columns-content");
        div.innerHTML = `
        <input type="text" name="edit-subtask-${subtaskIndex}" id="board-info-edit-subtask-${subtaskIndex}" value="" required>
        <label for="board-info-edit-subtask-${subtaskIndex}">
          <button type="button" class="remove-subtask">
            <img src="./assets/icon-cross.svg" alt="">
          </button>
        </label>
      `;
        editTaskColumns.appendChild(div);
      }
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
      const addTaskInputsLength = document.querySelectorAll(
        ".add-task-popup .board-info-columns-content input"
      ).length;
      const index = addTaskInputsLength;
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
    });

    const cancelSubtaskAdded = document.querySelectorAll(
      ".add-task-popup .remove-subtask"
    );
    cancelSubtaskAdded.forEach((cancelBtn, index) => {
      cancelBtn.addEventListener("click", () => {
        // taskLS = Storage.getTaskLS("single-task");
        addTaskColumns.removeChild(cancelBtn.parentElement.parentElement);
        // taskLS.singleSubtaskCompletion.splice(index, 1);
        // taskLS.singleSubtasks.splice(index, 1);

        // Storage.setTaskLS("new-task", taskLS);
      });
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
  // function for setting boards and calling a function to set board data
  populateBoards(boards) {
    boards.forEach((board, index) => {
      allBoards.innerHTML += `
      <button class="board board-btn" aria-controls="board-content">
        <img src="./assets/icon-board.svg" alt="">
        ${board.boardName}
      </button>
      `;
      this.setActiveBoard();
      this.activeBoardFunctionality(index);
    });
    boardsCount.textContent = boards.length;
    console.log(boards);
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
        <button class="single-content task-popup-btn" aria-controls="view-task-popup" data-column=${i} data-id=${j}>
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

  preventSubmitForm();
});
