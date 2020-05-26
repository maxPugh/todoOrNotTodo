//.------- TO DO LIST -------
//* ABILITY TO CREATE NEW TODOS AND PUSH THEM WITH ENTER
//* ATTACH EVENT HANDLERS TO NEWLY CREATED TODO ITEMS
//* WHEN PRESSING ENTER, CREATE NEW EMPTY TODO AND FOCUS ON IT
//* WHEN PRESSING TAB, NEST THE CURRENT TODO IN THE PREVIOUS ONE
//* WHEN PRESSING SHIFT + TAB, UNNEST THE CURRENT TODO
//* WHEN PRESSING SHIFT + ENTER CREATE A NEW UNNESTED TODO
//* WRITE FUNCTION TO HANDLE DELETION OF COMPLETED TODOS
//* LINK IT TO BUTTON CLICK
//* HANDLE DELETE ALL AND ALSO BUTTON CLICK
//! HANDLE LOCAL STORAGE INTEGRATION WITH A SET AND GET FUNCTION STORAGE(SET,GET)

//* WHEN BACKSPACE IS PRESSED ON AN EMPTY TODO IT WILL DELETE THAT TODO AND GO TO LINE END OF PREVIOUS TODO
//* MAKE SURE THAT FOCUS IS ON LINE END
//* SPLICE INTO PLACE TO ADD NEW TODOS
//* EVENT LISTENER ON KEY PRESS TO SAVE CURRENT VALUE TO INPUT
//* SOLVE ISSUE WHERE IF YOURE HOLDING DOWN BACKSPACE IT WILL AUTO GO TO NEXT LINE AND START DELETING
//* SET THE PREVIOUS

//? ANIMATION ANIMATION
//* FINISH CLICKTODOICON()

document.addEventListener("DOMContentLoaded", () => {
  //.Function to handle keypressEvents
  function eventHandler(e) {
    //if enter is pressed then end current todo
    if (e.keyCode == 13) {
      //if shift + enter are pressed
      if (util.map[13] == true && util.map[16] == true) {
        App.completeTodo(e);
      } else {
        App.createTodo(e);
      }
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
    focusedTodoID: "first",
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
          return `style ="text-decoration: line-through; color: grey"`;
        } else {
          return "";
        }
      }
      //how to handle nested todos
      function nestedTodos() {
        if (todo.nested.length > 0) {
          var ul = "<ul class='ul'>";
          todo.nested.forEach((todo) => {
            var nestedTodoString = App.generateTodo(
              todo,
              util.returnNext(icon)
            );
            ul += nestedTodoString;
          });

          ul += "</ul>";
          return ul;
        } else {
          return "";
        }
      }
      //the string
      htmlString = `<li id="${todo.id}" class="li">
                    <div id="icon">
                    <img id ="todo-icon-${todo.id}" src=${icon}>
                    <input ${completedTodo(todo)} value="${todo.title}">
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
    completeTodo: function (e) {
      var id = util.findTodoId(e);

      var todo = util.recurseThis((e) => e.id == id);

      todo.completed = !todo.completed;

      var style = e.target.nextElementSibling.style;
      if (todo.completed) {
        style.textDecoration = "line-through";
        style.color = "grey";
      } else {
        style.textDecoration = "";
        style.color = "";
      }

      var state = todo.completed;

      if (todo.nested.length > 0) {
        for (const t of todo.nested) {
          R(t);
        }

        function R(todo) {
          //RECURSIVE CASE
          if (todo.nested.length > 0) {
            for (const t of todo.nested) {
              R(t);
            }
          }
          //BASE CASE
          todo.completed = state;

          if (todo.completed) {
            style.textDecoration = "line-through";
            style.color = "grey";
          } else {
            style.textDecoration = "";
            style.color = "";
          }
        }
      }

      //check completed could have been integrated into this function and this function cleaned up
      //if i refactor then i might do this
      util.checkCompleted();
    },
    //. Function that completes
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

      //work out completed tree
      util.checkCompleted();
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
    toggleShortcuts() {
      var shortcuts = document.getElementById("flex30");
      setTimeout(() => {
        if (
          shortcuts.style.display == "block" ||
          shortcuts.style.display == ""
        ) {
          shortcuts.style.display = "none";
        } else {
          shortcuts.style.display = "block";
        }
      }, 150);
    },
    checkCompleted() {
      //this function has gone through some iterations
      // initially it relied on rendertodos and thus generate todos to handle the styling change
      // what this meant was that the todos were being repainted during the animation settimeout delay for button press on todo icon
      // this lead to the animation being cut short
      // so what i did was changed the styling 'on the fly' so i didnt need to wait for a rerender
      // the same applies to completeTodo()
      App.todos.forEach((todo) => {
        R(todo);
      });

      function R(todo) {
        var counter = 0;
        if (todo.nested.length > 0) {
          for (const t of todo.nested) {
            if (t.nested.length > 0) {
              R(t);
            }
            //the base case has to come after to recursive
            // as the recursive case can potentially modifies t.completed
            t.completed === true ? counter++ : null;
            var style = util.findInput(t.id).style;
            if (t.completed) {
              style.textDecoration = "line-through";
              style.color = "grey";
            } else {
              style.textDecoration = "";
              style.color = "";
            }
          }
          todo.nested.length === counter
            ? (todo.completed = true)
            : (todo.completed = false);

          var style = util.findInput(todo.id).style;
          if (todo.completed) {
            style.textDecoration = "line-through";
            style.color = "grey";
          } else {
            style.textDecoration = "";
            style.color = "";
          }
        }
      }
    },
    clearCompleted() {
      App.todos.forEach((todo, index, array) => {
        if (todo.completed && todo.id == "first") {
          todo.title = "";
          todo.completed = false;
          App.focusedTodoID = "first";
        }
        if (todo.completed && todo.id !== "first") {
          array.splice(index, 1);
        } else if (todo.nested.length > 0) {
          R(todo);
        }
      });
      function R(todo) {
        var t = todo.nested;
        //uses for loop so i can control i's value
        for (let i = 0; i < t.length; i++) {
          if (t[i].completed) {
            t.splice(i, 1);
            //handles shift down
            i--;
          } else if (t[i].nested.length > 0) {
            R(t[i]);
          }
        }
      }
    },
  };

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

      var s = window.getComputedStyle(e.target);
      var matrix = new WebKitCSSMatrix(s.webkitTransform);
      var offset = Math.round(matrix.m41);

      //create the animation if it doesnt already exist
      var style = document.querySelector("style");

      if (!style.innerHTML.indexOf("click")) {
        style.innerHTML += `
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
    clickTodoIcon(e) {
      //stores current todo position
      //works out how far that is from the left of the screen
      // offsets the icon to that position plus width of icon
      //sets 100% transition to be original position
      //ease in so it speeds up
      // hits the text
      //shakes the text?
      // todo completes

      //get the offset value for the element
      var offset = e.target.getBoundingClientRect().left + e.target.width;

      //create the animation
      var style = document.querySelector("style");
      var animationName = e.target.id;

      //these animations will be specific to each of the icons
      if (style.innerHTML.indexOf(animationName) < 0) {
        style.innerHTML += `
        @keyframes ${animationName} {
          0% {transform: translateX(-${offset}px)
          }
          40% {
            transform: translateX(5px)
          }
          45% {
            transform: translateX(-20px)
          }
          55% {
            transform: translateX(-20px)
          }
          65% {
            transform: translateX(-20px)
          }
          70% {
            transform: translateX(0px)
          }
          75% {
            transform: translateX(-10px)
          }
          85% {
            transform: translateX(-10px)
          }
          95% {
            transform: translateX(-10px)
          }

          100% {
            transform: translateX(0px)
          }
        }
      `;
      }
      //add all of the animation css to the element style
      var eStyle = e.target.style;

      eStyle.animationName = `${animationName}`;
      eStyle.animationDuration = "700ms";
      eStyle.animationTimingFunction = "ease-out";

      //this will apply the todo styling at the desired delay
      // in this case it is once the animation "hits" the element so at 40% animation
      setTimeout(() => {
        App.completeTodo(e);
      }, 280);

      //unset the animation
      setTimeout(() => {
        eStyle.animationName = "";
      }, 700);
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

  //. HANDLES CLICKING ANIMATION + FUNCTIONS
  document.getElementById("flex70").addEventListener("click", (e) => {
    var el = e.target.id;
    // handle animation for buttons
    if (el == "shortcut" || el == "delete" || el == "clear") {
      anim.clickIcon(e);
    }

    //shortcut toggle
    if (el == "shortcut") {
      util.toggleShortcuts();
    }

    //clear completed button
    if (el == "clear") {
      util.clearCompleted();
      App.renderTodos();
    }

    //click delete
    if (el == "delete") {
      App.todos = [];
      App.todos.push({
        id: "first",
        title: "",
        nested: [],
        completed: false,
      });
      App.focusedTodoID = "first";
      App.renderTodos();
    }
    //todo icon click
    if (el.indexOf("todo-icon") >= 0) {
      anim.clickTodoIcon(e);
    }
  });
});
