(function(window) {

  /**
   * Reset the app and start it from scratch. This is called when we click reset
   * as well as when the app is started the first time.
   */
  function globalReset() {
    var quiz = document.getElementById('quiz'),
        back = document.querySelector('.back'),
        next = document.querySelector('.next');


    // Must be sure to remove these event listeners, otherwise all hell breaks
    // loose after reset because the events will still get fired with the
    // old window.app, eventhough I set it to null here.
    if (window.app) {
      back.removeEventListener('click', app.onBack);
      next.removeEventListener('click', app.onNext);
    }

    window.app = null;
    removeClass(quiz, 'game-over next-ok back-ok');

    window.app = new Quiz([
      {
        text: "Who is the president of the US?",
        answer: 0, // The index of the correct answer in the choices array
        choices: [
          "Barrack Obama",
          "Dudebrohouse",
          "Percey Jackson"
        ]
      },{
        text: "Who started disney land?",
        answer: 1, // The index of the correct answer in the choices array
        choices: [
          "Warren Buffet",
          "Walt Disney",
          "Shwarma King"
        ]
      },{
        text: "What's your favorite color?",
        answer: 2, // The index of the correct answer in the choices array
        choices: [
          "Red",
          "Green",
          "Blue",
          "Turqois",
          "Funny"
        ]
      },{
        text: "Who is most sexy?",
        answer: 3, // The index of the correct answer in the choices array
        choices: [
          "Selma Hayek",
          "Eva Mendes",
          "Penelope Cruz",
          "Francois"
        ]
      }
    ]);

    app.initialize();

    // Add event listeners for the controls
    var back  = document.querySelector('.back'),
        next  = document.querySelector('.next');

    back.addEventListener('click', app.onBack);
    next.addEventListener('click', app.onNext);
  }

  /**
   * A quick extend function to avoid constantly writing out Quiz.prototype when
   * adding to the prototype.
   */
  function extend(destination, source) {
    for (var key in source)
      if (source.hasOwnProperty(key))
        destination[key] = source[key];
  }

  /**
   * Remove all child nodes of a given node. Note, this is MUCH faster than
   * using innerHTML = ''. See: http://jsperf.com/innerhtml-vs-removechild/47
   */
  function emptyNode(node) {
    while (node.firstChild)
      node.removeChild(node.firstChild);
  }

  /**
   * Add one ore more classes to an element. Classes are only added if they are
   * not already present.
   */
  function addClass(node, classNames) {
    var classes = node.className.split(' ');

    if (classes.indexOf(classNames) === -1)
      classes.push(classNames);

    node.className = classes.join(' ');
  }

  /**
   * Remove a class from an element. Classes are only removed if they are not
   * already present.
   */
  function removeClass(node, className) {

    var classNames = className.split(' ');

    if (classNames.length > 1) {
      classNames.forEach(function(name) {
        removeClass(node, name);
      });
      return;
    }

    var classes = node.className.split(' '),
        i       = classes.indexOf(className);

    if (i === -1) return false;

    classes.splice(i, 1);

    node.className = classes.join(' ');
  }

  function addChangeListeners(fragment) {
    var radios = fragment.querySelectorAll('input'),
        quiz   = document.getElementById('quiz');

    for (var i = 0; i < radios.length; i++) {
      radios[i].addEventListener('change', function(e) {
        addClass(quiz, 'next-ok');
      });
    }
  }

  /**
   * The main event. The Quiz constructor.
   */
  function Quiz(questions) {
    this.questions = questions;
    this.currentQuestion = 0;
  }

  extend(Quiz.prototype, {

    /**
     * Initialize the quiz app. THis will be called when the document is ready.
     */
    initialize: function() {
      var _this = this;

      this.progressEl = document.querySelector('.progress');
      this.questionEl = document.getElementById('question');
      this.el         = document.getElementById('quiz');

      // Bind these functions to this so that they can be added and removed as
      // event listeners.
      this.onBack     = this.back.bind(this);
      this.onNext     = this.next.bind(this);

      // Render the first question
      this.renderQuestion(this.questions[0]);

    },

    /**
     * Update the x/total progress indicator that tells the user how far they
     * are through the quiz.
     */
    updateProgress: function() {
      var text = (this.currentQuestion + 1) + '/' + this.questions.length;
      this.progressEl.textContent = text;
    },

    /**
     * Will replace the currently visible quesiton with a new one. The html of
     * the currently visible quesiton will be intirely removed, but will still
     * be accessible if it needs to be re-rendered (i.e. the back button) on the
     * original question object. In other words:
     *
     * question.html will be a document fragment containing the questions HTML,
     * unless it is being rendered for the first time.
     */
    renderQuestion: function(question) {

      // Create the questions inner HTML as a document fragment.
      if (!question.html) {
        question.html = document.createDocumentFragment();
        var h2 = document.createElement('h2');
        h2.textContent = question.text;
        h2.className = 'question';

        var choices = document.createElement('div');
        choices.className = 'choices input-group';

        question.choices.forEach(function(choiceText, i) {

          var input = document.createElement('input');
          input.id = 'choice' + i;
          input.type = 'radio';
          input.name = 'answer';
          input.value = i;

          var label = document.createElement('label');
          label.setAttribute('for', 'choice' + i);

          label.appendChild(input);
          label.appendChild(document.createTextNode(choiceText));

          choices.appendChild(label);
        });

        question.html.appendChild(h2);
        question.html.appendChild(choices);
      }

      emptyNode(this.questionEl);

      // Note: We clone the node so that we can re-use the doc fragment we built
      // up previously. If we simply appended it qeustion.html would still be
      // a fragment but it would be empty, so pressing the back button would
      // fail.
      // Note: as a side-effect, IE is probably unsupported.
      var clone = question.html.cloneNode(true);
      addChangeListeners(clone);
      this.questionEl.appendChild(clone);

      // Reinstate the users last choice if they have answered this question
      // before.
      if (typeof question.chosenAnswer !== 'undefined') {
        document.forms.question.elements.answer.value = question.chosenAnswer;
        addClass(this.el, 'next-ok');
      } else {
        removeClass(this.el, 'next-ok');
      }

      this.updateProgress();
    },

    /**
     * Increment the value of this.currentQuestion and then render the question
     * at the newly incremented index.
     */
    next: function() {
      var i = this.currentQuestion + 1;

      if (i >= this.questions.length) {
        this.showScore();
        return;
      }

      this.updateScore();
      addClass(this.el, 'back-ok');

      this.currentQuestion = i;
      this.renderQuestion(this.questions[i]);
    },

    back: function() {
      var i = this.currentQuestion - 1;

      // Can't go back from zero. This is just a safety measure since the
      // disabled button should not be directly clickable.
      if (i < 0) return false;

      // Disable the back button if this is the first question.
      if (i === 0) removeClass(this.el, 'back-ok');

      // Reinstate the users last answer
      // var radios = document.forms.question.elements.answer;
      // radios.value = this.questions[i].chosenAnswer;
      // addClass(this.el, 'next-ok');

      this.currentQuestion = i;
      this.renderQuestion(this.questions[i]);
    },

    updateScore: function() {
      var form     = document.forms.question,
          answer   = Number(form.elements.answer.value),
          question = this.questions[this.currentQuestion];

      question.chosenAnswer = answer;
    },

    showScore: function() {

      var score = 0;

      this.questions.forEach(function(question) {
        if (question.chosenAnswer === question.answer) score++;
      });

      this.scoreFrag = this.scoreFrag || document.createDocumentFragment();

      var h3 = document.createElement('h3');
      h3.textContent = 'Your score was';

      var scoreEl = document.createElement('h1');
      scoreEl.textContent = score;

      var totalEl = document.createElement('p');
      totalEl.className = 'small';
      totalEl.textContent = 'Out of ' + this.questions.length;

      this.scoreFrag.appendChild(h3);
      this.scoreFrag.appendChild(scoreEl);
      this.scoreFrag.appendChild(totalEl);
      emptyNode(this.questionEl);
      this.questionEl.appendChild(this.scoreFrag);

      addClass(this.el, 'game-over');
    }

  });

  // Initialize everything
  document.addEventListener('DOMContentLoaded', function() {

    // This creates the Quiz instance and sets it to window.app;
    globalReset();

    var reset = document.querySelector('.reset');
    reset.addEventListener('click', globalReset);
  });

})(this);

