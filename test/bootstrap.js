// Bootstrap Test Reporter function
var reporter = function () {

  var total = 0;
  var passes = 0;
  var fails = 0;

  var that = {
    test: function (result, message) {
      total++;

      if (result) {
        passes++;
        iconElement = $('icons');
        iconElement.appendChild(new Element('img', {src: '../images/accept.png'}));
      }
      else {
        fails++;
        var fails_report = $('fails');
        fails_report.show();

        iconElement = $('icons');
        iconElement.appendChild(new Element('img', {src: '../images/exclamation.png'}));

        var failMessages = $('fail_messages');
        var newFail = new Element('p', {'class': 'fail'});
        newFail.innerHTML = message;
        failMessages.appendChild(newFail);
      }
    },

    summary: function () {
      summary = new Element('p', {'class': ((fails > 0) ? 'fail_in_summary' : '') });
      summary.innerHTML = total + ' tests, ' + passes + ' passing, ' + fails + ' failed.';

      var summaryElement = $('results_summary');
      summaryElement.appendChild(summary);
      summaryElement.show();
    }
  }
  return that;
}();

var testMatchersComparisons = function () {
  Jasmine = jasmine_init();
  reporter.test(expects_that(true).should_equal(true),
      'expects_that(true).should_equal(true) returned false');

  reporter.test(!(expects_that(false).should_equal(true)),
      'expects_that(true).should_equal(true) returned true');

  reporter.test(expects_that(true).should_not_equal(false),
      'expects_that(true).should_not_equal(false) retruned false');

  reporter.test(!(expects_that(true).should_not_equal(true)),
      'expects_that(true).should_not_equal(false) retruned true');
}

var testMatchersReporting = function () {
  Jasmine = jasmine_init();

  expects_that(true).should_equal(true);
  expects_that(false).should_equal(true);

  reporter.test((Jasmine.results.length == 2),
      "Jasmine results array doesn't have 2 results");

  reporter.test((Jasmine.results[0].passed == true),
      "First spec didn't pass");

  reporter.test((Jasmine.results[1].passed == false),
      "Second spec did pass");

  Jasmine = jasmine_init();

  expects_that(false).should_equal(true);

  reporter.test((Jasmine.results[0].message == 'Expected true but got false.'),
      "Failed expectation didn't test the failure message");

  Jasmine = jasmine_init();

  expects_that(true).should_equal(true);

  reporter.test((Jasmine.results[0].message == 'Passed.'),
      "Passing expectation didn't test the passing message");
}

var testSpecs = function () {
  Jasmine = jasmine_init();
  var spec = it('new spec');
  reporter.test((spec.description == 'new spec'),
      "Spec did not have a description");

  Jasmine = jasmine_init();
  var another_spec = it('spec with an expectation').runs(function () {
    var foo = 'bar';
    expects_that(foo).should_equal('bar');
  });
  another_spec.execute();
  another_spec.done = true;

  reporter.test((Jasmine.results.length == 1),
      "Results aren't there after a spec was executed");
  reporter.test((Jasmine.results[0].passed == true),
      "Results has a result, but it's true");

  Jasmine = jasmine_init();
  var yet_another_spec = it('spec with failing expectation').runs(function () {
    var foo = 'bar';
    expects_that(foo).should_equal('baz');
  });
  yet_another_spec.execute();
  another_spec.done = true;

  reporter.test((Jasmine.results[0].passed == false),
      "Expectation that failed, passed");

  Jasmine = jasmine_init();
  var yet_yet_another_spec = it('spec with multiple assertions').runs( function () {
    var foo = 'bar';
    var baz = 'quux';

    expects_that(foo).should_equal('bar');
    expects_that(baz).should_equal('quux');
  });
  yet_yet_another_spec.execute();
  another_spec.done = true;

  reporter.test((Jasmine.results.length == 2),
      "Spec doesn't support multiple expectations");
}

var testAsyncSpecs = function () {
  Jasmine = jasmine_init();
  var foo = 0;

  var a_spec = it('simple queue test').
      runs(function () {
    foo++;
  }).then(function() {
    expects_that(foo).should_equal(1)
  });

  reporter.test(a_spec.queue.length === 2,
      'Spec queue length is not 2');

  Jasmine = jasmine_init();
  foo = 0;
  a_spec = it('spec w/ queued statments').
      runs(function () {
    foo++;
  }).then(function() {
    expects_that(foo).should_equal(1);
  });

  a_spec.execute();

  reporter.test((Jasmine.results.length === 1),
      'No call to waits(): Spec queue did not run all functions');
  reporter.test((Jasmine.results[0].passed === true),
      'No call to waits(): Queued expectation failed');

  Jasmine = jasmine_init();
  foo = 0;
  a_spec = it('spec w/ queued statments').
      runs(function () {
             setTimeout(function() {
               foo++
             }, 500);
          }).waits(1000).
      then(function() {
            expects_that(foo).should_equal(1);
      });

  a_spec.execute();
  setTimeout(function(){
    reporter.test((Jasmine.results.length === 1),
        'Calling waits(): Spec queue did not run all functions');

    reporter.test((Jasmine.results[0].passed === true),
        'Calling waits(): Queued expectation failed');
  }, 1250);

  setTimeout(function() {
    Jasmine = jasmine_init();
    var bar = 0;
    var another_spec = it('spec w/ queued statments').
        runs(function () {
               setTimeout(function() {
                 bar++;
               }, 250);
            }).
        waits(500).
        then(function () {
               setTimeout(function() {
                 bar++;
               }, 250);
            }).
        waits(1500).
        then(function() {
          expects_that(bar).should_equal(2);
        });

    another_spec.execute();
    setTimeout(function(){
      reporter.test((another_spec.queue.length === 3),
          'Calling 2 waits(): Spec queue was less than expected length');
      reporter.test((Jasmine.results.length === 1),
          'Calling 2 waits(): Spec queue did not run all functions');
      reporter.test((Jasmine.results[0].passed === true),
          'Calling 2 waits(): Queued expectation failed');
    }, 2500);
  }, 1500);

  setTimeout(function() {
    Jasmine = jasmine_init();
    var baz = 0;
    var yet_another_spec = it('spec w/ async fail').
        runs(function () {
               setTimeout(function() {
                 baz++;
               }, 250);
            }).
        waits(100).
        then(function() {
          expects_that(baz).should_equal(1);
        });

    yet_another_spec.execute();
    setTimeout(function(){
      reporter.test((yet_another_spec.queue.length === 2),
          'Calling 2 waits(): Spec queue was less than expected length');
      reporter.test((Jasmine.results.length === 1),
          'Calling 2 waits(): Spec queue did not run all functions');
      reporter.test((Jasmine.results[0].passed === false),
          'Calling 2 waits(): Queued expectation failed');
    }, 2500);
  }, 5000);


}

var runTests = function () {
  $('spinner').show();

  testMatchersComparisons();
  testMatchersReporting();
  testSpecs();
  testAsyncSpecs();
  
  setTimeout(function() {
    $('spinner').hide();
    reporter.summary();
  }, 10000);
}

  //it('should be an async test') {
  //  run(function() {setup}).and.wait(2000).then.expects_that(true).should_equal(true).and.expects_that
  //}

