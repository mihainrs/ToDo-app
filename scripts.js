let container = document.querySelector('.todos-container');
let addCircle = document.querySelector('.input-circle');

let todo = document.querySelectorAll('.todo');
let checkCircle = document.querySelectorAll('.circle');
let check = document.querySelectorAll('.border');

let ex = document.querySelectorAll('.ex');

let draggable;

let pointerStartX;
let pointerStartY;

let items = [];

const reorderedItems = [];

reOrder();


// dragging to re-order
function reOrder(){
container.addEventListener('mousedown', dragStart);
container.addEventListener('touchstart', dragStart);
document.addEventListener('mouseup', dragEnd);
document.addEventListener('touchend', dragEnd);

// while dragging
function drag(e) {
    console.log('Dragging');

    if (!draggable) return;

    e.preventDefault();

    const currentPositionX = e.clientX || e.touches[0].clientX;
    const currentPositionY = e.clientY || e.touches[0].clientY;

    const pointerOffsetX = currentPositionX - pointerStartX;
    const pointerOffsetY = currentPositionY - pointerStartY;

    draggable.style.transform = `translate(${pointerOffsetX}px, ${pointerOffsetY}px)`;

    updateIdleItemsStateAndPosition();
    
}

// clicking and holding to start dragging
function dragStart(e) {

    console.log('Drag Start');


    if (e.target.classList.contains('todo')) {
        draggable = e.target.closest('.todo');
    }

    if (!draggable) return


    pointerStartX = e.clientX || e.touches[0].clientX;
    pointerStartY = e.clientY || e.touches[0].clientY;


    
    itemsState();
    disablePageScroll();
    becomeDraggable();

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false })
}

// letting go to stop
function dragEnd() {
    console.log('Drag end');
    if (!draggable) return

    applyNewItemsOrder();
    cleanup();
}

function becomeDraggable() {
    draggable.classList.remove('isIdle');
    draggable.classList.add('isDraggable');
}

function unsetDraggable() {
    draggable.style = null;
    draggable.classList.remove('isDraggable');
    draggable.classList.add('isIdle');
    draggable = null;
}


function cleanup() {
    items = [];
    unsetDraggable();
    unsetItemState();
    enablePageScroll();

    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
}

function itemsState() {
    getIdleItems().forEach((item, i) => {
        if (getAllItems().indexOf(draggable) > i) {
            item.dataset.isAbove = '';
        }
    })
}

function getAllItems() {
    if (!items?.length) {
        items = Array.from(container.querySelectorAll('.todo'));
    }
    return items;
}

function getIdleItems() {
    return getAllItems().filter((item) => item.classList.contains('isIdle'));
}



function updateIdleItemsStateAndPosition() {
    const draggableItemRect = draggable.getBoundingClientRect();
    const draggableItemY =
        draggableItemRect.top + draggableItemRect.height / 2;
    const ITEMS_GAP = 10;

    // Update state
    getIdleItems().forEach((item) => {
        const itemRect = item.getBoundingClientRect()
        const itemY = itemRect.top + itemRect.height / 2;
        if (isItemAbove(item)) {
            if (draggableItemY <= itemY) {
                item.dataset.isToggled = '';
            } else {
                delete item.dataset.isToggled;
            }
        } else {
            if (draggableItemY >= itemY) {
                item.dataset.isToggled = '';
            } else {
                delete item.dataset.isToggled;
            }
        }
    })

    // Update position
    getIdleItems().forEach((item) => {
        if (isItemToggled(item)) {
            const direction = isItemAbove(item) ? 1 : -1;
            item.style.transform = `translateY(${direction * (draggableItemRect.height + ITEMS_GAP)
                }px)`;
        } else {
            item.style.transform = '';
        }
    })
}

function isItemAbove(item) {
    return item.hasAttribute('data-is-above');
}

function isItemToggled(item) {
    return item.hasAttribute('data-is-toggled');
}


function applyNewItemsOrder() {
    const reorderedItems = [];
  
    getAllItems().forEach((item, index) => {
      if (item === draggable) {
        return;
      }
      if (!isItemToggled(item)) {
        reorderedItems[index] = item;
        return;
      }
      const newIndex = isItemAbove(item) ? index + 1 : index - 1;
      reorderedItems[newIndex] = item;
    })
  
    for (let index = 0; index < getAllItems().length; index++) {
      const item = reorderedItems[index];
      if (typeof item === 'undefined') {
        reorderedItems[index] = draggable;
      }
    }
  
    reorderedItems.forEach((item) => {
      container.appendChild(item);
    })
  }

  function unsetItemState() {
    getIdleItems().forEach((item, i) => {
      delete item.dataset.isAbove;
      delete item.dataset.isToggled;
      item.style.transform = '';
    })
  }

  // disable scroll while dragging

  function disablePageScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.userSelect = 'none';
  }
  
  function enablePageScroll() {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.style.userSelect = '';
  }

}

// check marks to tell completed tasks from incomplete

for (let i = 0; i < checkCircle.length; i++) {
    checkCircle[i].addEventListener("click", () => {
        if (checkCircle[i].style.display = 'flex') {
            checkCircle[i].style.display = 'none';
            check[i].style.display = 'flex';
            todo[i].classList.add("strike");
        }
    })
}

for (let j = 0; j < checkCircle.length; j++) {
    check[j].addEventListener("click", () => {
        if (check[j].style.display = 'flex') {
            checkCircle[j].style.display = 'flex';
            check[j].style.display = 'none';
            todo[j].classList.remove("strike");
        }
    })
}

// deletion button

for(let v=0; v<todo.length;v++){
    todo[v].addEventListener("mouseover", ()=>{
        ex[v].style.display="flex";
    })

    todo[v].addEventListener("mouseout", ()=>{
        ex[v].style.display="none";
    })

    ex[v].addEventListener("click",()=>{6
        todo[v].style.display="none";
    })
}




//add a new task

function newTask(){

    let task = document.querySelector('.todo-input').value;

    let taskCross= new Image();
    taskCross.src = "images/icon-cross.svg";

    let taskElement = document.createElement('p');
    taskElement.innerHTML= task;

    let taskCheck = new Image();
    taskCheck.src ="images/icon-check.svg";

    let checkContainer = document.createElement("div");
    checkContainer.appendChild(taskCheck);
    checkContainer.className="border";

    let taskCircle = document.createElement("div");
    taskCircle.className="circle";
    
    let taskContainer = document.createElement('div');
    taskContainer.appendChild(taskCross);
    taskContainer.appendChild(taskElement);
    taskContainer.appendChild(checkContainer);
    taskContainer.className="todo isIdle";

    document.querySelector("todos-container").appendChild(taskContainer);
}

addCircle.addEventListener("click", ()=>{
    newTask();
})