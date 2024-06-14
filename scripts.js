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
delet();
addCheckListeners();
filters();

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

    
    delet();
    addCheckListeners();
    filters();
}


// add deletion button

function delet() {
    // Get current todo and ex 
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
                todo.style.display="none"; // Remove the todo item
                
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



function filters(){

    let allFliters = document.querySelectorAll(".All");
    let activeFilters = document.querySelectorAll('.Active');
    let completedFilters= document.querySelectorAll('.Completed');
    let clearCompletedFilter = document.querySelector('.clear-completed');
    let todos = document.querySelectorAll('.todo');


    allFliters.forEach((allFilter,) =>{
       allFilter.addEventListener('click', ()=>{
        todos.forEach((todo,) => {
            if (todo) {
                todo.style.display='flex';
            }
        });
       })
    })

    activeFilters.forEach((activeFilter, ) =>{
        activeFilter.addEventListener('click', ()=>{
            todos.forEach((todo,) => {
                if (todo.classList.contains("strike")) {
                    todo.style.display='none';
                } else
                todo.style.display='flex';
            });
        })
     })

     completedFilters.forEach((completedFilter, ) =>{
        completedFilter.addEventListener('click', ()=>{
            todos.forEach((todo,) => {
                if (todo.classList.contains("strike")) {
                    todo.style.display='flex';
                } else
                todo.style.display='none';
            });
        })
     })

    clearCompletedFilter.addEventListener('click', ()=>{
        todos.forEach((todo,) => {
            if (todo.classList.contains("strike")) {
                todo.remove();
            }
        })
    })

}


// light theme

function changeTheme(){
    let themeChanger = document.querySelector('.theme-changer');
    let themeCounter = 0;
    let bgPic1 = document.getElementById('background1');
    let bgPic2 = document.getElementById('background2');
    let todos = document.querySelectorAll('.todo');
    let todoInputContainer = document.querySelector('.todo-input');
    let todoInput = document.querySelector('.textInput');
    let bottomPart = document.querySelector('.bottom-part');
    let wholeContainer = document.querySelector('.todos-container');

    themeChanger.addEventListener('click', ()=>{
        if(themeCounter === 0){
        themeChanger.src = "images/icon-moon.svg";
        themeCounter=1;
        bgPic1.srcset="images/bg-mobile-light.jpg";
        bgPic2.srcset="images/bg-desktop-light.jpg";
       document.body.style.backgroundColor = 'var(--VeryLightGray)';
       todoInputContainer.style.backgroundColor ='var(--VeryLightGray)';
       todoInput.style.backgroundColor ='var(--VeryLightGray)';
       bottomPart.style.backgroundColor ='var(--VeryLightGray)';
       wholeContainer.style.boxShadow='1px 50px 25px gray';
       

       } else {

        wholeContainer.style.boxShadow='1px 50px 25px black';
        bottomPart.style.backgroundColor ='var(--VeryDarkDesaturatedBlue)';
        todoInput.style.backgroundColor ='var(--VeryDarkDesaturatedBlue)';
        todoInputContainer.style.backgroundColor ='var(--VeryDarkDesaturatedBlue)';
       document.body.style.backgroundColor = 'var(--VeryDarkBlue)';
       bgPic1.srcset="images/bg-mobile-dark.jpg";
       bgPic2.srcset="images/bg-desktop-dark.jpg";
       themeChanger.src = "images/icon-sun.svg"
       themeCounter=0;
    }
       

    })

    themeChanger.addEventListener('click', ()=>{
        todos.forEach((todo) => {
            if(themeCounter===0){
                todo.style.backgroundColor ='var(--VeryDarkDesaturatedBlue)';
            } else
            todo.style.backgroundColor ='var(--VeryLightGray)';
           
        })
    })

}

changeTheme();