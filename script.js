let allTasks = JSON.parse(localStorage.getItem('allTasks')) || [];
let valueInput = '';
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

const onClickAddTask = async () => {
  const input = document.getElementById('addTask');
  if (input === null) {
    return;
  }
  if (valueInput.trim() === '') {
    return;
  }
  const resp = await fetch(`${host}/createTask`, {
    method: 'POST',
    headers: hdrs,
    body: JSON.stringify({
      text: valueInput,
      isCheck: false,
      creationTime: new Date()
    })
  });
  const result = await resp.json();
  allTasks = result;
  localStorage.setItem('Tasks', JSON.stringify(allTasks));
  valueInput = '';
  input.value = '';
  render();
} 

const updateValue = (event) => {
  valueInput = event.target.value;
}

const render = () => {
  const content = document.getElementById('contentPage');
  if (content === null) {
    return;
  }

  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }

  allTasks.forEach((item) => {
    let { itemId, itemIsCheck } = { itemId: item._id, itemIsCheck: item.isCheck };
    let previousValue = '';

    const container = document.createElement('div');
    const checkbox = document.createElement('input');
    const text = document.createElement('p');
    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');
    const editImg = document.createElement('img');
    const deleteImg = document.createElement('img');

    editImg.src = 'img/edit.svg';
    deleteImg.src = 'img/close.svg';

    container.id = `${itemId}`;
    container.className = item.isCheck ? 'taskContainer Checked' : 'taskContainer Unchecked';

    checkbox.type = 'checkbox';
    checkbox.checked = item.isCheck;
        
    [text.innerText, text.className] = [item.text, item.isCheck ? 'textTask doneText' : 'textTask'];

    editButton.className = item.isCheck ? 'textTask editButton' : 'buttonEdit';
    editButton.appendChild(editImg);
    
    deleteButton.className = 'deleteButton';
    deleteButton.appendChild(deleteImg);

    container.appendChild(checkbox);
    container.appendChild(text);
    container.appendChild(editButton);
    container.appendChild(deleteButton);

    checkbox.onchange = () => {
      onChangeTaskCheckbox(itemId, itemIsCheck);
    };

    editButton.onclick = () => {
      onCLickEditTask(itemId, previousValue, text, editButton, deleteButton);
    }

    deleteButton.onclick = () => {
      onClickDeleteTask(itemId);
    }

    content.appendChild(container);
  });
}

const onChangeTaskCheckbox = async (id, check) => {
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

const onCLickEditTask = async (id, previousValue, text, editButton, deleteButton) => {
  const parent = document.getElementById(id);
  if (parent === null) {
    return;
  }

  const replacableText = document.createElement('input');
  const doneButton = document.createElement('button');
  const cancelButton = document.createElement('button');
  const doneImg = document.createElement('img');
  const cancelImg = document.createElement('img');
  
  input.type = 'text';

  cancelButton.className = 'cancelButton';
  doneButton.className = 'doneButton';
  
  doneImg.src = 'img/done.svg';
  cancelImg.src = 'img/close.svg';
  
  doneButton.appendChild(doneImg);
  cancelButton.appendChild(cancelImg);

  replaceElems(id, text, editButton, doneButton, deleteButton, cancelButton, replacableText);

  previousValue = previousValue.innerText;

  return previousValue;
}

const onClickDoneTask = async (id, newValue) => {
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

const onClickDeleteTask = async (id) => {
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

const onClickCancelTaskEditing = async (id, previousValue) => {
  // const resp = await fetch(`${host}/updateTask`, {
  //   method: 'PATCH',
  //   headers: hdrs,
  //   body: JSON.stringify({
  //     _id: id,
  //     text: previousValue
  //   })
  // });
  // const result = await resp.json();
  // allTasks = result;
  // localStorage.setItem('Tasks', JSON.stringify(allTasks));
  render();
}

const replaceElems = async (id, text, editButton, doneButton, deleteButton, cancelButton, replacableText) => {
  text.replaceWith(replacableText);
  editButton.replaceWith(doneButton);
  deleteButton.replaceWith(cancelButton);
  replacableText.focus();

  doneButton.onclick = () => {
    onClickDoneTask(id, replacableText.value);
  }

  cancelButton.onclick = () => {
    onClickCancelTaskEditing();
  }
}