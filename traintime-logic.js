// Steps to complete:

// 1. Create Firebase link
// 2. Create initial train data in database
// 3. Create button for adding new trains - then update the html + update the database
// 4. Create a way to retrieve trains from the trainlist.
// 5. Create a way to calculate the time way. Using difference between start and current time.
//    Then take the difference and modulus by frequency. (This step can be completed in either 3 or 4)

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCcPFcbAjIsgXGQwE-A3AcOXkeD40qypE8",
  authDomain: "train-times-93583.firebaseapp.com",
  databaseURL: "https://train-times-93583.firebaseio.com",
  storageBucket: "train-times-93583.appspot.com"
};

firebase.initializeApp(config);

var trainData = firebase.database();

// 2. Populate Firebase Database with initial data (in this case, I did this via Firebase GUI)
// 3. Button for adding trains
$("#add-train-btn").on("click", function(event) {
  // Prevent the default form submit behavior
  event.preventDefault();

  // Grabs user input
  //a new id was created to be used when the train is being named. then we attached a value and trim method at the end of our new id
  var trainName = $("#train-name-input")
    .val()
    .trim();
    //a new id was created to be used when the destination is being used.  then we attached a value and trim method at the end of our new id
  var destination = $("#destination-input")
    .val()
    .trim();
    //a new id was created to hold the first trains input. then we attached a value and trim method at the end of our new id
  var firstTrain = $("#first-train-input")
    .val()
    .trim();
    //a new id was created to hold the the value of the frequency. then we attached a value and trim method at the end of our new id
  var frequency = $("#frequency-input")
    .val()
    .trim();
  
  // Creates local "temporary" object for holding train data
  var newTrain = {
    name: trainName,
    destination: destination,
    firstTrain: firstTrain,
    frequency: frequency
  };

  // Uploads train data to the database
  //does exactly what is says above
  trainData.ref().push(newTrain);

  // Logs everything to console
  //logs the information for the trains  name
  console.log(newTrain.name);
  //logs the information for the destination
  console.log(newTrain.destination);
  //logs the information for the trains our first train
  console.log(newTrain.firstTrain);
  //logs the information for the trains frequency 
  console.log(newTrain.frequency);

  // Alert
  // this line a code will run once a value has be add by the user
  alert("Train successfully added");

  // Clears all of the text-boxes
  //once the user is done putting their information we clear out the values in the input boxes and set them to an empty string
  $("#train-name-input").val("");
  $("#destination-input").val("");
  $("#first-train-input").val("");
  $("#frequency-input").val("");
});

// 4. Create Firebase event for adding trains to the database and a row in the html when a user adds an entry
//the preChidKey is declared but never read for some reason??
trainData.ref().on("child_added", function(childSnapshot, prevChildKey) {
  console.log(childSnapshot.val());

  // Store everything into a variable.
  //take the info from the input boxes that were stored into an object and then placed into new variables
  var tName = childSnapshot.val().name;
  var tDestination = childSnapshot.val().destination;
  var tFrequency = childSnapshot.val().frequency;
  var tFirstTrain = childSnapshot.val().firstTrain;
// we are splitting the value at : and storing everything after the : into the timearr variable
  var timeArr = tFirstTrain.split(":");
  var trainTime = moment()
    .hours(timeArr[0])
    .minutes(timeArr[1]);
  var maxMoment = moment.max(moment(), trainTime);
  //stores train minutes
  var tMinutes;
  //stores trains arrival time
  var tArrival;

  // If the first train is later than the current time, sent arrival to the first train time
  if (maxMoment === trainTime) {
    tArrival = trainTime.format("hh:mm A");
    tMinutes = trainTime.diff(moment(), "minutes");
  } else {
    // Calculate the minutes until arrival using hardcore math
    // To calculate the minutes till arrival, take the current time in unix subtract the FirstTrain time
    // and find the modulus between the difference and the frequency.
    var differenceTimes = moment().diff(trainTime, "minutes");
    var tRemainder = differenceTimes % tFrequency;
    tMinutes = tFrequency - tRemainder;
    // To calculate the arrival time, add the tMinutes to the current time
    tArrival = moment()
    //adds minutes to train arrival time
      .add(tMinutes, "m")
      .format("hh:mm A");
  }
  //console logging out train's minutes
  console.log("tMinutes:", tMinutes);
  //console logging out train's minutes
  console.log("tArrival:", tArrival);

  // Add each train's data into the table
  $("#train-table > tbody").append(
    $("<tr>").append(
      $("<td>").text(tName),
      $("<td>").text(tDestination),
      $("<td>").text(tFrequency),
      $("<td>").text(tArrival),
      $("<td>").text(tMinutes)
    )
  );
});

// Assume the following situations.

// (TEST 1)
// First Train of the Day is 3:00 AM
// Assume Train comes every 3 minutes.
// Assume the current time is 3:16 AM....
// What time would the next train be...? ( Let's use our brains first)
// It would be 3:18 -- 2 minutes away

// (TEST 2)
// First Train of the Day is 3:00 AM
// Assume Train comes every 7 minutes.
// Assume the current time is 3:16 AM....
// What time would the next train be...? (Let's use our brains first)
// It would be 3:21 -- 5 minutes away

// ==========================================================

// Solved Mathematically
// Test case 1:
// 16 - 00 = 16
// 16 % 3 = 1 (Modulus is the remainder)
// 3 - 1 = 2 minutes away
// 2 + 3:16 = 3:18

// Solved Mathematically
// Test case 2:
// 16 - 00 = 16
// 16 % 7 = 2 (Modulus is the remainder)
// 7 - 2 = 5 minutes away
// 5 + 3:16 = 3:21
