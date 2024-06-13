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

let numVar = 0;
numVar = todo.length;

reOrder();
delet();
addCheckListeners();

//add a new task

function newTask() {

    let task = document.querySelector('.textInput').value;

    let taskCross = new Image();
    taskCross.src = "images/icon-cross.svg";
    taskCross.className = "ex";

    let taskElement = document.createElement('p');
    taskElement.innerHTML = task;

    let taskCheck = new Image();
    taskCheck.src = "images/icon-check.svg";

    let checkContainer = document.createElement("div");
    checkContainer.appendChild(taskCheck);
    checkContainer.className = "border";

    let taskCircle = document.createElement("div");
    taskCircle.className = "circle";

    let taskContainer = document.createElement('div');
    taskContainer.appendChild(taskCircle);
    taskContainer.appendChild(checkContainer);
    taskContainer.appendChild(taskElement);
    taskContainer.appendChild(taskCross);

    taskContainer.className = "todo isIdle";
    container.appendChild(taskContainer);
    numVar += 1;
    
    delet();
    addCheckListeners();
}



// add deletion button

function delet() {
    // Get current todo and ex elements
    let todos = document.querySelectorAll('.todo');
    let crosses = document.querySelectorAll('.ex');

    todos.forEach((todo, index) => {
        let cross = crosses[index]; // Corresponding cross element

        // Check if cross element exists to avoid errors
        if (cross) {
            todo.addEventListener("mouseover", () => {
                cross.style.display = "flex";
            });

            todo.addEventListener("mouseout", () => {
                cross.style.display = "none";
            });

            cross.addEventListener("click", () => {
                todo.remove(); // Remove the todo item
            });
        }
    });
}


// dragging to re-order
function reOrder() {
    container.addEventListener('mousedown', dragStart);
    container.addEventListener('touchstart', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);

    // while dragging
    function drag(e) {
       

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

function addCheckListeners() {
    let circles = document.querySelectorAll('.circle');
    let checks = document.querySelectorAll('.border');
    let todos = document.querySelectorAll('.todo');

    circles.forEach((circle, i) => {
        circle.addEventListener("click", () => {
            if (circle.style.display = 'flex') {
                circle.style.display = 'none';
                checks[i].style.display = 'flex';
                todos[i].classList.add("strike");
            }
        });
    });

    checks.forEach((check, j) => {
        check.addEventListener("click", () => {
            if (check.style.display = 'flex') {
                circles[j].style.display = 'flex';
                check.style.display = 'none';
                todos[j].classList.remove("strike");
            }
        });
    });
}

// task filters

filters();

function filters(){

    let allFliters = document.querySelectorAll(".All");
    let activeFilters = document.querySelectorAll('.Active');
    let completedFilters= document.querySelectorAll('.Completed');

    allFliters.forEach((allFilter, k) =>{
       allFilter.addEventListener('click', ()=>{
           console.log('Yeet');
       })
    })

}
