function addTask() {
  const taskInput = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");

  if (taskInput.value.trim() !== "") {
    const li = document.createElement("li");
    li.textContent = taskInput.value;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => taskList.removeChild(li);
    li.appendChild(deleteButton);

    taskList.appendChild(li);
    taskInput.value = "";
  }
}

/* function addTask() {
  const taskInput = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");

  if (taskInput.value.trim() !== "") {
    const li = document.createElement("li");
    li.textContent = taskInput.value;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => taskList.removeChild(li);
    li.appendChild(deleteButton);

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.onclick = () => {
      const newTask = prompt("Edit task:", li.textContent);
      if (newTask !== null && newTask.trim() !== "") {
        li.textContent = newTask;
      }
    };
    li.appendChild(editButton);

    taskList.appendChild(li);
    taskInput.value = "";
  }
} */

// tried out a new script but not working as expected will solve it later and make an better source
