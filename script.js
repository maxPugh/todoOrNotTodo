//.------- TO DO LIST -------
//* ABILITY TO CREATE NEW TODOS AND PUSH THEM WITH ENTER
//* ATTACH EVENT HANDLERS TO NEWLY CREATED TODO ITEMS
//* WHEN PRESSING ENTER, CREATE NEW EMPTY TODO AND FOCUS ON IT
//* WHEN PRESSING TAB, NEST THE CURRENT TODO IN THE PREVIOUS ONE
//* WHEN PRESSING SHIFT + TAB, UNNEST THE CURRENT TODO
//! WHEN PRESSING SHIFT + ENTER CREATE A NEW UNNESTED TODO

//* WHEN BACKSPACE IS PRESSED ON AN EMPTY TODO IT WILL DELETE THAT TODO AND GO TO LINE END OF PREVIOUS TODO
//* MAKE SURE THAT FOCUS IS ON LINE END
//* SPLICE INTO PLACE TO ADD NEW TODOS
//* EVENT LISTENER ON KEY PRESS TO SAVE CURRENT VALUE TO INPUT
//* SOLVE ISSUE WHERE IF YOURE HOLDING DOWN BACKSPACE IT WILL AUTO GO TO NEXT LINE AND START DELETING
//* SET THE PREVIOUS

//? ANIMATION ANIMATION
//! BLUR NEEDS TO START FROM OFFSET AND WORK ITS WAY OUT FROM THERE

//.Function to handle keypressEvents
function eventHandler(e) {
  //if enter is pressed then end current todo
  if (e.keyCode == 13) {
    App.createTodo(e);
  }
  //if  tab is pressed then turn current into nested
  if (e.keyCode == 9) {
    //if tab and shift are pressed (either way around)
    if (util.map[9] == true && util.map[16] == true) {
      e.preventDefault();
      App.unnestCurrentTodo(e);
    } else {
      e.preventDefault();
      App.nestCurrentTodo(e);
    }
  }

  //if backspace is pressed and todo.title is empty then run deleteTodo
  if (e.keyCode == 8) {
    if (util.map.counter === 0 && e.target.value == "") {
      e.preventDefault();
      App.deleteTodo(e);
    }
    util.backspaceCounter(e);
  }

  // if ctrl is pressed the current todo is complete
  if (e.keyCode == 17) {
    //make current todo complete
  }
}

var App = {
  todos: [
    {
      id: "first",
      title: "",
      nested: [],
      completed: false,
    },
  ],
  focusedTodoID: 0,
  icon: `"images/esoteric/quill.svg"`,
  //.Function that creates todos in the Array based on input
  createTodo: function (e) {
    //save current todos value
    util.saveTodoValue(e);
    //create todo object
    var todoData = {
      id: `${util.createId()}`,
      title: "",
      nested: [],
      completed: false,
      madeFrom: util.findTodoId(e),
    };

    //find parent array
    var li = e.target.closest("li");
    var parentArray = util.findParentArray(li.id);

    //find element index in array
    var index = parentArray.findIndex((ele) => ele.id == li.id);
    //splice new todo after current
    parentArray.splice(index + 1, 0, todoData);
    //set focusedTodoId
    App.focusedTodoID = todoData.id;
    //renderTodos
    App.renderTodos();
  },
  //.Function to generate the html based on the todos array
  generateTodo: function (todo, icon) {
    var htmlString = "";
    function completedTodo() {
      if (todo.completed === true) {
        return `className = "completed"`;
      } else {
        return "";
      }
    }
    //how to handle nested todos
    function nestedTodos() {
      if (todo.nested.length > 0) {
        var ul = "<ul class='ul'>";
        todo.nested.forEach((todo) => {
          var nestedTodoString = App.generateTodo(todo, util.returnNext(icon));
          ul += nestedTodoString;
        });

        ul += "</ul>";
        return ul;
      } else {
        return "";
      }
    }
    //the string
    htmlString = `<li ${completedTodo(todo)} id="${todo.id}" class="li">
                    <div id="icon">
                    <img src=${icon}>
                    <input value="${todo.title}">
                    ${nestedTodos()}
                    </div>
                  </li>`;
    return htmlString;
  },
  //. Moves current todo to a be a nested in the previous todo
  nestCurrentTodo: function (e) {
    var li = e.target.closest("li");
    //save the input value
    util.saveTodoValue(e);
    //find previous element sibling
    var sibling = li.previousElementSibling;
    //if sibling exists then
    if (sibling) {
      //find index of current todo
      var index = util
        .findParentArray(li.id)
        .findIndex((ele) => ele.id == li.id);
      //splice it out
      var current = util.findParentArray(li.id).splice(index, 1);
      //find sibling object
      //add current todo object to sibling.nested
      util.recurseThis((e) => e.id == sibling.id).nested.push(current[0]);
      //set focusedTodoID (accounts for todos created out of order)
      App.focusedTodoID = util.findTodoId(e);
      //renderTodos
      App.renderTodos();
    }
  },
  //. Moves current todo to be a child of the parents parent list
  unnestCurrentTodo: function (e) {
    //find the LI of where you want it to go
    var destLi = e.target.closest("li").parentNode.closest("li");

    if (destLi == null) {
      return 0;
    }

    var currentId = e.target.closest("li").id;
    var currentTodo = util.recurseThis((e) => e.id == currentId);

    //cut out the todo
    var cArray = util.findParentArray(currentId);
    var cIndex = cArray.findIndex((e) => e.id == currentId);
    var cSplice = cArray.splice(cIndex, 1);

    var dArray = util.findParentArray(destLi.id);
    var dIndex = dArray.findIndex((e) => e.id == destLi.id);
    dArray.splice(dIndex + 1, 0, cSplice[0]);

    App.renderTodos();
  },
  //.Deletes current todo
  deleteTodo: function (e) {
    //find todo id
    var id = util.findTodoId(e);
    //prevent deletion of main todo
    if (id === "first") {
      return 0;
    }
    //find todo array
    var array = util.findParentArray(id);
    //find todo index
    var index = array.findIndex((ele) => ele.id == id);
    //set focusedTodoId to be currentTodo.madeFrom
    App.focusedTodoID = util.recurseThis((e) => e.id == id).madeFrom;
    //Cut out current todo from array
    array.splice(index, 1);
    //Render
    App.renderTodos();
  },
  //.Function that renders the newly created todos
  renderTodos: function () {
    var todoList = document.getElementById("todo-list");
    var htmlString = "";
    //loop through each todo
    App.todos.forEach((todo) => {
      var current = App.generateTodo(todo, App.icon);
      htmlString += current;
    });
    //set the inner html to the created string
    todoList.innerHTML = htmlString;
    //sort out which todo should have focus
    if (App.focusedTodoID) {
      util.findInput(App.focusedTodoID).focus();
      util.findInput(App.focusedTodoID).setSelectionRange(1000, 1000);
    }
  },
};

var util = {
  //. Object to hold keypresses
  map: { counter: 0 },
  keyDown: function (e) {
    util.map[e.keyCode] = true;
  },
  keyUp: function (e) {
    util.map[e.keyCode] = false;
  },
  backspaceCounter: function (e) {
    if (e.type == "keydown") {
      util.map.counter++;
    }
    if (e.type == "keyup") {
      util.map.counter = 0;
    }
  },

  //. Function that creates a unique ID
  createId: function () {
    return Date.now();
  },
  //. Function to find input based on ID
  findInput: function (id) {
    var li = document.getElementById(id);
    for (const i of li.childNodes) {
      if (i.tagName == "DIV") {
        for (const j of i.childNodes) {
          if (j.tagName == "INPUT") {
            return j;
          }
        }
      }
    }
  },
  //. returns the array that the todo is in
  findParentArray: function (id) {
    // step up to the closest LI
    var array = App.todos;
    // find what array that exists in
    function recurseArray(array) {
      for (const el of array) {
        if (el.id == id) {
          return array;
        } else if (el["nested"]?.length > 0) {
          var hi = recurseArray(el["nested"]);
          if (hi) {
            return hi;
          }
        }
      }
    }
    return recurseArray(array);
  },
  //. Function that returns todo ID
  findTodoId: function (e) {
    return (id = e.target.closest("li").id);
  },
  //. saves the value of the todo
  saveTodoValue: function (e) {
    var li = e.target.closest("li");
    util.recurseThis((e) => e.id == li.id).title = e.target.value.trim();
  },
  //. Return the todo that fits the criteria of the callback
  recurseThis(callback) {
    function insideFunction(array) {
      for (const el of array) {
        if (callback(el)) {
          return el;
        } else if (el["nested"]?.length > 0) {
          var hi = insideFunction(el["nested"]);
          if (hi) {
            return hi;
          }
        }
      }
    }
    return insideFunction(App.todos);
  },
  returnNext(current) {
    var array = [
      `"images/esoteric/quill.svg"`,
      `"images/esoteric/candle.svg"`,
      `"images/esoteric/palm.svg"`,
      `"images/esoteric/khanda.svg"`,
      `"images/esoteric/crystalball.svg"`,
    ];
    var length = array.length - 1;

    var current = array.indexOf(current);

    var c =
      current < length
        ? current + 1
        : current === length
        ? length - length
        : null;

    return array[c];
  },
};

//! THIS IS JUST ALL SHIT TO MAKE IT RUN
var i = document.getElementById("todo-list");
i.addEventListener("keydown", (e) => {
  util.keyDown(e);
  eventHandler(e);
});
i.addEventListener("keyup", (e) => {
  util.keyUp(e);
  util.saveTodoValue(e);
  util.backspaceCounter(e);
});
App.renderTodos();
document.getElementById("first").childNodes[1].childNodes[3].focus();
//! ------------------------------------

//. HOVER ANIMATION ON MOUSEOVER
document.getElementById("flex70").addEventListener("mouseover", (e) => {
  var el = e.target.id;
  if (el == "shortcut" || el == "delete" || el == "clear") {
    anim.showShadow(e);
  }
});

//. REMOVAL OF SHADOW ON MOUSEOUT
document.getElementById("flex70").addEventListener("mouseout", (e) => {
  var el = e.target.id;
  if (el == "shortcut" || el == "delete" || el == "clear") {
    anim.hideShadow(e);

    //this line makes sure that the follow up animation to a click are deleted on mouseout
    // so that normal functioning will happen on hover
    e.target.style = "";
    e.target.nextElementSibling.style = "";
  }
});

//. HANDLES CLICKING ANIMATION
document.getElementById("flex70").addEventListener("click", (e) => {
  var el = e.target.id;
  if (el == "shortcut" || el == "delete" || el == "clear") {
    anim.clickIcon(e);
  }
});

var anim = {
  showShadow(e) {
    var s = e.target.nextElementSibling;
    setTimeout(() => {
      s.style.opacity = 0.5;
      s.className = "addedClass";
    }, 110);
  },
  hideShadow(e) {
    var s = e.target.nextElementSibling;
    s.style.opacity = 0;
    s.className = "";
  },
  clickIcon(e) {
    var eStyle = e.target.style;
    var eShadow = e.target.nextElementSibling.style;

    var style = window.getComputedStyle(e.target);
    var matrix = new WebKitCSSMatrix(style.webkitTransform);
    var offset = Math.round(matrix.m41);
    //creates a style element
    var style = document.createElement("style");
    //attaches it to head if it doesnt exist (button already pressed)
    if (document.querySelector("style")) {
    } else {
      document.head.appendChild(style);
      //create the animation based on the offset
      style.innerHTML = `
        @keyframes click {
          0% {transform: translate(${offset}px, ${offset}px)}
          50% {transform: translate(0px, 0px)}
          100% {transform: translate(${offset}px, ${offset}px)}
        }
        `;
    }
    eStyle.animationName = "click";
    eStyle.animationDuration = "150ms";
    // blur animation wasnt resetting on set timeout and was going out of sync
    eShadow.animationName = "";
    // hover animation now needs to be set minus the rise animation, delayed by the length of the click animation
    setTimeout(() => {
      eStyle.animationName = "hovering";
      eStyle.animationDuration = "2s";
      eStyle.animationIterationCount = "infinite";
      eStyle.animationTimingFunction = "ease-in-out";

      // same thing has to happen for the blur
      e.target.nextElementSibling.className = "";
      eShadow.animationName = "blurHover";
      eShadow.animationDuration = "2s";
      eShadow.animationIterationCount = "infinite";
      eShadow.animationTimingFunction = "ease-in-out";
    }, 150);
  },
};
