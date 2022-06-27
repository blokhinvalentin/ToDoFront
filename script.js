let input = null;
let allTasks = JSON.parse(localStorage.getItem('allTasks')) || [];
let valueInput = '';
const host = 'http://localhost:8000';
const hdrs = {
  'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*'
};

window.onload = async () => {
  if (document.getElementById('addTask') !== null) {
    input = document.getElementById('addTask');
  } else {
    console.error('no such element');
  }
  
  input.focus();
  input.addEventListener('change', updateValue);
  const resp = await fetch(`${host}/allTasks`, {
    method: 'GET'
  });
  const result = await resp.json();
  allTasks = result.data;
  localStorage.setItem('Tasks', JSON.stringify(allTasks));
  render();
}

const onClickAddTaskButton = async () => {
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

const render = async () => {
  const content = document.getElementById('contentPage');
  if (content === null) {
    console.error('no such element');
  }

  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }

  allTasks.forEach((item) => {
    [itemId] = [item._id];
    let previousValue = '';

    const container = document.createElement('div');
    const checkbox = document.createElement('input');
    const text = document.createElement('p');
    const editButton = document.createElement('button');
    const doneButton = document.createElement('button');
    const deleteButton = document.createElement('button');
    const cancelButton = document.createElement('button');
    const newText = document.createElement('input');

    container.id = `${itemId}`;
    container.className = item.isCheck ? 'taskContainer Checked' : 'taskContainer Unchecked';

    checkbox.type = 'checkbox';
    checkbox.checked = item.isCheck;
        
    [text.innerText, text.className] = [item.text, item.isCheck ? 'textTask doneText' : 'textTask'];


    editButton.className = item.isCheck ? 'textTask editButton' : 'buttonEdit';
    editButton.style.backgroundImage = "url('img/edit.svg')";

    doneButton.className = 'doneButton';
    doneButton.style.backgroundImage = "url('img/done.svg')";

    
    deleteButton.className = 'deleteButton';
    deleteButton.style.backgroundImage = "url('img/close.svg')";

    cancelButton.className = 'cancelButton';
    cancelButton.style.backgroundImage = "url('img/close.svg')";
    
    newText.type = 'text';

    container.appendChild(checkbox);
    container.appendChild(text);
    container.appendChild(editButton);
    container.appendChild(deleteButton);

    checkbox.onchange = () => {
      onChangeTaskCheckbox(container.id, checkbox.checked);
    };

    editButton.onclick = () => {
      previousValue = onCLickEditTask(container.id, previousValue);
      text.replaceWith(newText);
      editButton.replaceWith(doneButton);
      deleteButton.replaceWith(cancelButton);
      newText.focus();
    }

    doneButton.onclick = () => {
      onClickDoneTask(container.id, newText.value);
    }

    deleteButton.onclick = () => {
      onClickDeleteTask(container.id);
    }

    cancelButton.onclick = () => {
      onClickCancelTaskEditing();
    }

    content.appendChild(container);
  });
}

const onChangeTaskCheckbox = async (id, check) => {
  const resp = await fetch(`${host}/updateTask`, {
    method: 'PATCH',
    headers: hdrs,
    body: JSON.stringify({
      _id: id,
      isCheck: check
    })
  });
  const result = await resp.json();
  allTasks = result;
  localStorage.setItem('Tasks', JSON.stringify(allTasks));
  render();
}

const onCLickEditTask = async (id, previousValue) => {
  previousValue = previousValue.innerText;

  return previousValue;
}

const onClickDoneTask = async (id, newValue) => {
  const resp = await fetch(`${host}/updateTask`, {
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
  allTasks = result;
  localStorage.setItem('Tasks', JSON.stringify(allTasks));
  render();
}

const onClickCancelTaskEditing = async (id, previousValue) => {
  const resp = await fetch(`${host}/updateTask`, {
    method: 'PATCH',
    headers: hdrs,
    body: JSON.stringify({
      _id: id,
      text: previousValue
    })
  });
  const result = await resp.json();
  allTasks = result;
  localStorage.setItem('Tasks', JSON.stringify(allTasks));
  render();
}