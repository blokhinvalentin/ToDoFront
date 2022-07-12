let allTasks = [];
const host = 'http://localhost:8000';
const hdrs = {
  'Content-Type': 'application/json;charset=utf-8',
  'Access-Control-Allow-Origin': '*'
};

window.onload = async () => {
  const input = document.getElementById('task-input');
  if (input === null) {
    return;
  }

  input.addEventListener('change', updateValue);

  try {
    const resp = await fetch(`${host}/allTasks`, {
      method: 'GET'
    });
    const result = await resp.json();
    allTasks = result;
  }
  catch(error) {
    alert('can get all tasks');
  }
  render();
}

const addTask = async () => {
  const input = document.getElementById('task-input');
  if (input === null || input.value.trim() === '') {
    return;
  }

  try {
    const resp = await fetch(`${host}/createTask`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify({
        text: input.value,
        isCheck: false
      })
    });
    const result = await resp.json();
    allTasks = result;
  }
  catch(error) {
    alert('unable to create task');
  }
  input.value = '';
  render();
} 

const updateValue = (event) => {
  const input = document.getElementById('task-input');
  if (input === null) {
    return;
  }
  input.value = event.target.value;
}

const render = () => {
  const content = document.getElementById('todo-list__content-page');
  if (content === null) {
    return;
  }

  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }

  allTasks.forEach((item) => {
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
    const resp = await fetch(`${host}/updateCheckbox/${id}`, {
      method: 'PATCH',
      headers: hdrs,
      body: JSON.stringify({
        _id: id,
        isCheck: !check
      })
    });
    const result = await resp.json();
    allTasks = result;
  }
  catch(error) {
    alert('unable to change checkbox');
  }
  render();
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

  cancelButton.className = 'todo-list__cancel';
  doneButton.className = 'todo-list__done';
  
  doneImg.src = 'img/done.svg';
  cancelImg.src = 'img/close.svg';
  
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
    doneTask(id, replacableText.value);
  }

  cancelButton.onclick = () => {
    cancelTaskEditing(id, text);
  }
}

const doneTask = async (id, newValue) => {
  if (newValue.trim() === '') {
    return;
  }

  try {
    const resp = await fetch(`${host}/updateText/${id}`, {
      method: 'PATCH',
      headers: hdrs,
      body: JSON.stringify({
        _id: id,
        text: newValue
      })
    });
    const result = await resp.json();
    allTasks = result;
  }
  catch(error) {
    alert('unable to update text');
  }
  render();
}

const deleteTask = async (id) => {
  try {
    const resp = await fetch(`${host}/deleteTask`, {
      method: 'DELETE',
      headers: hdrs,
      body: JSON.stringify({_id: id})
    });
    const result = await resp.json();
    
    if (result.deletedCount !== 0) {
      allTasks = allTasks.filter(task => task._id !== id);
    }
  }
  catch(error) {
    alert('unable to delete task');
  }
  render();
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

  deleteButton.className = 'todo-list__delete';
  editButton.className = checkbox.checked ? 'todo-list__hide' : 'todo-list__edit';
  
  editImg.src = 'img/edit.svg';
  deleteImg.src = 'img/close.svg';
  
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