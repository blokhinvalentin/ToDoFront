let input = null;
let allTasks = JSON.parse(localStorage.getItem('allTasks')) || [];
let valueInput = '';
const host = 'http://localhost:8000';
const hdrs = {
  'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*'
};

window.onload = async () => {
  input = document.getElementById('addTask');
  input.focus();
  input.addEventListener('change', updateValue);
  input.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      valueInput = event.target.value;
      onClickAddButton();
    } 
  });
  const resp = await fetch(`${host}/allTasks`, {
    method: 'GET'
  });
  const result = await resp.json();
  allTasks = result.data;
  console.log(allTasks);
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render();
}

const onClickAddButton = async () => {
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
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  valueInput = '';
  input.value = '';
  render();
} 

const updateValue = (event) => {
  valueInput = event.target.value;
}

const render = async () => {
  const content = document.getElementById('contentPage');

  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }

  allTasks.forEach((item, index) => {
    let previousValue = '';
    const itemId = item._id;
    const container = document.createElement('div');
    container.id = `${itemId}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.isCheck;
    container.className = item.isCheck ? 'taskContainer Checked' : 'taskContainer Unchecked';
    checkbox.onchange = () => {
      onChangeCheckbox(checkbox);
    };

    container.appendChild(checkbox);
    const text = document.createElement('p');
    [text.innerText, text.className] = [item.text, item.isCheck ? 'textTask doneText' : 'textTask'];
    container.appendChild(text);

    const imageEdit = document.createElement('img');
    imageEdit.className = item.isCheck ? 'textTask editImg' : 'imgEdit';
    imageEdit.src = 'img/edit.svg';
    container.appendChild(imageEdit, previousValue);
    imageEdit.onclick = function() {
      previousValue = onCLickEdit(imageEdit, previousValue);
    }

    const imageDelete = document.createElement('img');
    imageDelete.src = 'img/close.svg';
    container.appendChild(imageDelete);
    imageDelete.onclick = function() {
      onClickDelete(imageDelete);
    }

    content.appendChild(container);
  });
}

const onChangeCheckbox = async (elem) => {
  const parent = elem.parentElement;
  const id = parent.id;
  console.log(id);
  console.log(elem.checked);

  const resp = await fetch(`${host}/updateTask`, {
    method: 'PATCH',
    headers: hdrs,
    body: JSON.stringify({
      _id: id,
      isCheck: elem.checked
    })
  });
  const result = await resp.json();
  allTasks = result;

  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render();
}

const onCLickEdit = async (elem, previousValue) => {
  const parent = elem.parentElement;
  let cancelButton = parent.getElementsByTagName('img');
  cancelButton = cancelButton[1];
  let text = parent.getElementsByTagName('p');
  text = text[0];
  previousValue = text;
  const editableText = document.createElement('input');
  editableText.type = 'text';
  text.replaceWith(editableText);
  elem.src = 'img/done.svg';
  editableText.focus();
  elem.onclick = function() {
    onClickDone(elem, previousValue);
  };
  cancelButton.onclick = function() {
    onClickCancel(elem, previousValue);
  }

  previousValue = previousValue.innerText;

  return previousValue;
}

const onClickDone = async (elem, previousValue) => {
  elem.src = 'img/edit.svg';
  const parent = elem.parentElement;
  const id0 = parent.id;
  let editableText = parent.getElementsByTagName('input');
  for (let i = 0; i < editableText.length; i++) {
    if (editableText[i].type === 'text') {
      editableText = editableText[i];
      const text2 = document.createElement('p');
      text2.innerText = editableText.value;
      text2.className = 'textTask';
      previousValue = text2;
      editableText.replaceWith(text2);
    }
  }
  
  const previousText = previousValue.innerText;
  const resp = await fetch(`${host}/updateTask`, {
        method: 'PATCH',
        headers: hdrs,
        body: JSON.stringify({
          _id: id0,
          text: previousText,
          isCheck: false
        })
      });
      const result = await resp.json();
      allTasks = result;
      localStorage.setItem('tasks', JSON.stringify(allTasks));
      render();
}

const onClickDelete = async (elem) => {
  const parent = elem.parentElement;
  const id = parent.id;

  const resp = await fetch(`${host}/deleteTask`, {
    method: 'DELETE',
    headers: hdrs,
    body: JSON.stringify({_id: id})
  });
  const result = await resp.json();
  allTasks = result;
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render();
}

const onClickCancel = async (elem, previousValue) => {
  const parent = elem.parentElement;
  const text2 = document.createElement('p');
  let editableText = parent.getElementsByTagName('input');
  for (let i = 0; i < editableText.length; i++) {
    if (editableText[i].type === 'text') {
      editableText = editableText[i];
      text2.className = 'textTask';
      text2.innerText = previousValue;
      editableText.replaceWith(text2);
    };
  }
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render();
}