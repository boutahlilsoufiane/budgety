var budgetController = (function () {
  var Income = function (id, value, description) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Expense = function (id, value, description) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentage = function (income) {
    if (income > 0) {
      this.percentage = Math.round((this.value / income) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var addItem = function (type, value, description) {
    var item, ID;

    if (data.allItems[type].length > 0) {
      ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
    } else {
      ID = 0;
    }

    if (type == 'inc') {
      item = new Income(ID, value, description);
    } else {
      item = new Expense(ID, value, description);
    }

    data.allItems[type].push(item);

    return item;
  };

  var data = {
    _id: -1,

    allItems: {
      inc: [],
      exp: [],
    },

    totals: {
      inc: 0,
      exp: 0,
    },

    budget: 0,
    percentage: 0,
  };

  var calculateBudget = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });

    data.totals[type] = sum;
    data.budget = data.totals['inc'] - data.totals['exp'];

    if (data.totals['inc'] > 0)
      data.percentage = Math.round(
        (data.totals['exp'] / data.totals['inc']) * 100
      );
  };

  var deleteItem = function (type, id) {
    var ids, index;

    ids = data.allItems[type].map(function (item) {
      return item.id;
    });

    index = ids.indexOf(id);

    if (index !== -1) {
      data.allItems[type].splice(index, 1);
    }
  };

  var getBudget = function () {
    return {
      _id: data._id,
      budget: data.budget,
      incTotal: data.totals.inc,
      expTotal: data.totals.exp,
      percentage: data.percentage,
    };
  };

  var calculatePercentages = function (income) {
    data.allItems.exp.forEach(function (cur) {
      cur.calculatePercentage(data.totals.inc);
    });
  };

  var getPercentages = function () {
    var percentages = data.allItems.exp.map(function (cur) {
      return cur.getPercentage();
    });

    return percentages;
  };

  return {
    addItem: addItem,
    testing: data,
    calculateBudget: calculateBudget,
    getBudget: getBudget,
    deleteItem: deleteItem,
    calculatePercentages: calculatePercentages,
    getPercentages: getPercentages,
  };
})();

var UIController = (function () {
  DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomesContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expPercLabel: '.item__percentage',
    monthLabel: '.budget__title--month',
    saveButton: '.save',
  };

  var formatNumber = function (num, type) {
    //remove negative numbers
    num = Math.abs(num);

    //rule1 take 2 number after .
    num = num.toFixed(2);

    //rule2 sepecarat every 3 numbers with comma
    var num = num.split('.');
    var int = num[0];
    var decimal = num[1];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    //rule3 add + or - next to number

    return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + decimal;
  };

  var nodeListForEeach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },
    getDOMstrings: function () {
      return DOMstrings;
    },
    addItemList: function (object, type) {
      var html, element, newhtml;

      if (type == 'inc') {
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>' +
          '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">' +
          '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

        element = DOMstrings.incomesContainer;
      } else if (type == 'exp') {
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>' +
          '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>' +
          '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
          '</div></div></div>';

        element = DOMstrings.expensesContainer;
      }

      newhtml = html.replace('%id%', object.id);
      newhtml = newhtml.replace('%description%', object.description);
      newhtml = newhtml.replace('%value%', formatNumber(object.value, type));

      document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
    },
    clearFields: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputValue + ', ' + DOMstrings.inputDescription
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach((field, i) => {
        field.value = '';
      });

      fieldsArr[0].focus();
    },
    displayBudget: function (obj) {
      var type;

      type = obj.budget > 0 ? 'inc' : 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.incTotal,
        'inc'
      );
      document.querySelector(
        DOMstrings.expenseLabel
      ).textContent = formatNumber(obj.expTotal, 'exp');
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    deleteItem: function (selectorId) {
      var el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    displayPercentages: function (percentages) {
      var percentageNodeList = document.querySelectorAll(
        DOMstrings.expPercLabel
      );

      nodeListForEeach(percentageNodeList, function (node, i) {
        node.textContent = percentages[i] + '%';
      });
    },

    displayMonth: function () {
      var date, month, year, months;

      months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      date = new Date();
      month = date.getMonth();
      year = date.getFullYear();

      document.querySelector(DOMstrings.monthLabel).textContent =
        months[month] + ' ' + year;
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          ',' +
          DOMstrings.inputDescription +
          ',' +
          DOMstrings.inputValue
      );

      nodeListForEeach(fields, function (node, index) {
        node.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },
  };
})();

var controller = (function (budgetCTL, uiCTL) {
  var setupEventListeners = function () {
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    addEventListener('keypress', function (event) {
      if (event.keyCode == 13 || event.which == 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);

    document
      .querySelector(DOMstrings.inputType)
      .addEventListener('change', uiCTL.changedType);
  };

  var ctrlAddItem = function () {
    //1.get the field input data
    var input = uiCTL.getInput();

    if (input.description != '' && !isNaN(input.value) && input.value > 0) {
      //2.add item to budget controller
      var item = budgetCTL.addItem(input.type, input.value, input.description);

      //3.add item to UI
      uiCTL.addItemList(item, input.type);

      //4.clear fields
      uiCTL.clearFields();

      //5.Calculate and update the budget
      updateBudget();

      //6.update Percentages
      updatePercentages();
    }
  };

  var ctrlSaveMonth = function () {
    // get totals
    const budget = budgetCTL.getBudget();

    // format data
    let data = {
      _id: budget._id,
      budget: budget.budget,
      income: budget.incTotal,
      expenses: budget.expTotal,
      incArr: data.totals.inc,
      expArr: data.totals.exp,
    };
    // send data
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/saveMonth', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  };

  var ctrlDeleteItem = function (event) {
    var ID, type, itemId, selectorId;

    ID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    selectorId = ID;

    if (ID) {
      ID = ID.split('-');
      type = ID[0];
      itemId = parseInt(ID[1]);

      //1-delete item from stucture data
      budgetCTL.deleteItem(type, itemId);

      //2-update items UI
      uiCTL.deleteItem(selectorId);

      //3-update budget
      updateBudget();

      //4-update percentages
      updatePercentages();
    }
  };

  var updateBudget = function () {
    //1.Calculate budget
    budgetCTL.calculateBudget('inc');
    budgetCTL.calculateBudget('exp');

    //2.Return budget
    var budget = budgetCTL.getBudget();

    //3.Update budget UI
    uiCTL.displayBudget(budget);
  };

  var updatePercentages = function () {
    //1-update updatePercentages
    budgetCTL.calculatePercentages();

    //2-get Percentages
    var percentages = budgetCTL.getPercentages();

    //3-display percentages
    uiCTL.displayPercentages(percentages);
  };

  var DOM = uiCTL.getDOMstrings();

  return {
    init: function () {
      console.log('Starting app...');

      //set Budget of month
      //Return budget
      var budget = budgetCTL.getBudget();
      //Update budget UI
      uiCTL.displayBudget(budget);
      uiCTL.displayMonth();

      setupEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
