let allTasks = [];
const host = 'http://localhost:8000/tasks';
const headers = {
  'Content-Type': 'application/json;charset=utf-8',
  'Access-Control-Allow-Origin': '*'
};

window.onload = async () => {
  const input = document.getElementById('task-input');
  if (input === null) {
    return;
  }

  try {
    const resp = await fetch(`${host}`, {
      method: 'GET'
    });
    const result = await resp.json();
    allTasks = result;
    render();
  } catch (error) {
    showError('Error: unable to get all items');
  }
}

const addTask = async () => {
  const input = document.getElementById('task-input');
  if (input === null || input.value.trim() === '') {
    return;
  }

  try {
    const resp = await fetch(`${host}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        text: input.value
      })
    });
    const result = await resp.json();
    allTasks.push(result);
    input.value = '';
    render();
  } catch (error) {
    showError('Error: unable to create task');
  }
} 

const render = () => {
  const content = document.getElementById('todo-list__content-page');
  if (content === null) {
    return;
  }

  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }

  const sortableTasks = [...allTasks];
  sortableTasks.sort((a, b) => {
    return (a.isCheck > b.isCheck) ? 1 : a.isCheck < b.isCheck ? 0 : -1; 
  });

  sortableTasks.forEach(item => {
    const { _id, isCheck, text } = item;

    const container = document.createElement('div');
    const checkbox = document.createElement('input');
    const containerText = document.createElement('p');  

    content.appendChild(container);

    container.id = `container-${_id}`;
    container.className = isCheck ? 'todo-list__task-container container__checked' : 'todo-list__task-container container__unchecked';

    checkbox.type = 'checkbox';
    checkbox.checked = isCheck;
    checkbox.id = `checkbox-${_id}`;
        
    [containerText.innerText, containerText.className] = [text, isCheck ? 'todo-list__text-task todo-list__done-text' : 'todo-list__text-task'];

    container.appendChild(checkbox);
    container.appendChild(containerText);

    checkbox.onchange = () => {
      onChangeCheckbox(_id, isCheck);
    };

    addButtons(_id, text);
  });
}

const onChangeCheckbox = async (id, check) => {
  try {
    const resp = await fetch(`${host}/${id}/checkbox`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify({
        isCheck: !check
      })
    });
    const result = await resp.json();
    for (let i = 0; i < allTasks.length; i++) {
      if (allTasks[i]._id === id) {
        allTasks[i] = result;
        break;
      }
    }
    render();
  } catch (error) {
    showError('Error: unable to change textbox');
  }
}

const editTask = async (id, text) => {
  const parent = document.getElementById(`container-${id}`);
  if (parent === null) {
    return;
  }

  const replacableText = document.createElement('input');
  const doneButton = document.createElement('button');
  const cancelButton = document.createElement('button');
  const doneImg = document.createElement('img');
  const cancelImg = document.createElement('img');

  replacableText.type = 'text';
  replacableText.value = text;

  cancelButton.className = 'todo-list-button cancel';
  doneButton.className = 'todo-list-button done';
  
  doneImg.src = 'img/done.svg';
  doneImg.alt = '';

  cancelImg.src = 'img/close.svg';
  cancelImg.alt = '';
  
  doneButton.appendChild(doneImg);
  cancelButton.appendChild(cancelImg);

  const buttons = parent.getElementsByTagName('button');
  const containerText = parent.getElementsByTagName('p');
  parent.removeChild(buttons[1]);
  parent.removeChild(buttons[0]);
  parent.removeChild(containerText[0]);
  parent.appendChild(replacableText);
  parent.appendChild(doneButton);
  parent.appendChild(cancelButton);

  replacableText.focus();

  doneButton.onclick = () => {
    doneTaskEditing(id, replacableText.value);
  }

  cancelButton.onclick = () => {
    cancelTaskEditing(id, text);
  }
}

const doneTaskEditing = async (id, newValue) => {
  if (newValue.trim() === '') {
    return;
  }

  try {
    const resp = await fetch(`${host}/${id}/text`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify({
        text: newValue
      })
    });
    const result = await resp.json();
    for (let i = 0; i < allTasks.length; i++) {
      if (allTasks[i]._id === id) {
        allTasks[i] = result;
        break;
      }
    }
    render();
  } catch (error) {
    showError('Error: unable to update text');
  }
}

const deleteTask = async (id) => {
  try {
    const resp = await fetch(`${host}/${id}`, {
      method: 'DELETE',
      headers: headers
    });
    const result = await resp.json();
    
    if (result.deletedCount !== 0) {
      allTasks = allTasks.filter(task => task._id !== id);
    }
    render();
  } catch (error) {
    showError('Error: unable to delete task');
  }
}

const cancelTaskEditing = async (id, text) => {
  const parent = document.getElementById(`container-${id}`);
  if (parent === null) {
    return;
  }

  const containerText = document.createElement('p');

  containerText.innerText = text;
  containerText.className = 'todo-list__text-task';

  const textToReplace = parent.getElementsByTagName('input');
  const buttons = parent.getElementsByTagName('button');
  parent.removeChild(buttons[1]);
  parent.removeChild(buttons[0]);
  parent.removeChild(textToReplace[1]);
  parent.appendChild(containerText);

  addButtons(id, text);
}

const addButtons = (id, text) => {
  const parent = document.getElementById(`container-${id}`);
  if (parent === null) {
    return;
  }

  const checkbox = document.getElementById(`checkbox-${id}`);
  if (checkbox === null) {
    return;
  }

  const editButton = document.createElement('button');
  const deleteButton = document.createElement('button');
  const editImg = document.createElement('img');
  const deleteImg = document.createElement('img');

  deleteButton.className = 'todo-list-button delete';
  editButton.className = checkbox.checked ? 'todo-list__hide' : 'todo-list-button edit';
  
  editImg.src = 'img/edit.svg';
  editImg.alt = '';

  deleteImg.src = 'img/close.svg';
  editImg.alt = '';
  
  editButton.appendChild(editImg);
  deleteButton.appendChild(deleteImg);
  parent.appendChild(editButton);
  parent.appendChild(deleteButton);

  editButton.onclick = () => {
    editTask(id, text);
  }

  deleteButton.onclick = () => {
    deleteTask(id);
  }
}

const showError = (errorMessage) => {
  const errorText = document.getElementById('error-text');
  if (errorText === null) {
    return;
  }

  errorText.innerText = errorMessage;
}