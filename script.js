let allTasks = JSON.parse(localStorage.getItem('allTasks')) || [];
const host = 'http://localhost:8000';
const hdrs = {
  'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*'
};

window.onload = async () => {
  const input = document.getElementById('addTask');
  if (input === null) {
    return;
  }

  input.focus();
  input.addEventListener('change', updateValue);

  const resp = await fetch(`${host}/allTasks`, {
    method: 'GET'
  });
  const result = await resp.json();
  allTasks = result;
  localStorage.setItem('Tasks', JSON.stringify(allTasks));
  render();
}

const addTask = async () => {
  const input = document.getElementById('addTask');
  if (input === null || input.value.trim() === '') {
    return;
  }

  const resp = await fetch(`${host}/createTask`, {
    method: 'POST',
    headers: hdrs,
    body: JSON.stringify({
      text: input.value,
      isCheck: false,
      creationTime: new Date()
    })
  });
  const result = await resp.json();
  allTasks = result;
  localStorage.setItem('Tasks', JSON.stringify(allTasks));
  input.value = '';
  render();
} 

const updateValue = (event) => {
  const input = document.getElementById('addTask');
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
    let previousValue = '';

    const container = document.createElement('div');
    const checkbox = document.createElement('input');
    const containerText = document.createElement('p');
    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');
    const editImg = document.createElement('img');
    const deleteImg = document.createElement('img');

    editImg.src = 'img/edit.svg';
    deleteImg.src = 'img/close.svg';

    container.id = `container-${_id}`;
    container.className = isCheck ? 'todo-list__task-container checked' : 'todo-list__task-container unchecked';

    checkbox.type = 'checkbox';
    checkbox.checked = isCheck;
        
    [containerText.innerText, containerText.className] = [text, isCheck ? 'todo-list__text-task todo-list__done-text' : 'todo-list__text-task'];

    editButton.className = isCheck ? 'todo-list__text-task todo-list__hide' : 'todo-list__edit';
    editButton.appendChild(editImg);
    
    deleteButton.className = 'todo-list__delete';
    deleteButton.appendChild(deleteImg);

    container.appendChild(checkbox);
    container.appendChild(containerText);
    container.appendChild(editButton);
    container.appendChild(deleteButton);

    checkbox.onchange = () => {
      onChangeCheckbox(_id, isCheck);
    };

    editButton.onclick = () => {
      editTask(_id, previousValue);
    }

    deleteButton.onclick = () => {
      deleteTask(_id);
    }

    content.appendChild(container);
  });
}

const onChangeCheckbox = async (id, check) => {
  const resp = await fetch(`${host}/updateCheckbox`, {
    method: 'PATCH',
    headers: hdrs,
    body: JSON.stringify({
      _id: id,
      isCheck: !check
    })
  });
  const result = await resp.json();
  allTasks = result;
  localStorage.setItem('Tasks', JSON.stringify(allTasks));
  render();
}

const editTask = async (id, previousValue) => {
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

  cancelButton.className = 'todo-list__cancel';
  doneButton.className = 'todo-list__done';
  
  doneImg.src = 'img/done.svg';
  cancelImg.src = 'img/close.svg';
  
  doneButton.appendChild(doneImg);
  cancelButton.appendChild(cancelImg);

  const buttons = parent.getElementsByTagName('button');
  const text = parent.getElementsByTagName('p');
  parent.removeChild(buttons[1]);
  parent.removeChild(buttons[0]);
  parent.removeChild(text[0]);
  parent.appendChild(replacableText);
  parent.appendChild(doneButton);
  parent.appendChild(cancelButton);

  replacableText.focus();

  doneButton.onclick = () => {
    doneTask(id, replacableText.value);
  }

  cancelButton.onclick = () => {
    cancelTaskEditing(id, previousValue);
  }

  previousValue = previousValue.innerText;

  return previousValue;
}

const doneTask = async (id, newValue) => {
  if (newValue.trim() === '') {
    return onClickCancelTaskEditing();
  }

  const resp = await fetch(`${host}/updateText`, {
    method: 'PATCH',
    headers: hdrs,
    body: JSON.stringify({
      _id: id,
      text: newValue
    })
  });
  const result = await resp.json();
  allTasks = result;
  localStorage.setItem('Tasks', JSON.stringify(allTasks));
  render();
}

const deleteTask = async (id) => {
  const resp = await fetch(`${host}/deleteTask`, {
    method: 'DELETE',
    headers: hdrs,
    body: JSON.stringify({_id: id})
  });
  const result = await resp.json();
  allTasks = allTasks.filter(task => task._id !== id);
  localStorage.setItem('Tasks', JSON.stringify(allTasks));
  render();
}

const cancelTaskEditing = async (id, previousValue) => {
  const parent = document.getElementById(`container-${id}`);
  if (parent === null) {
    return;
  }

  const text = document.createElement('p');
  const editButton = document.createElement('button');
  const deleteButton = document.createElement('button');
  const editImg = document.createElement('img');
  const deleteImg = document.createElement('img');

  text.innerText = previousValue;

  deleteButton.className = 'todo-list__delete';
  editButton.className = 'todo-list__edit';
  
  editImg.src = 'img/edit.svg';
  deleteImg.src = 'img/close.svg';
  
  editButton.appendChild(editImg);
  deleteButton.appendChild(deleteImg);

  const textToReplace = parent.getElementsByTagName('input');
  const buttons = parent.getElementsByTagName('button');
  parent.removeChild(buttons[1]);
  parent.removeChild(buttons[0]);
  parent.removeChild(textToReplace[1]);
  parent.appendChild(text);
  parent.appendChild(editButton);
  parent.appendChild(deleteButton);

  render();
}