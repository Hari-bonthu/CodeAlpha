function calculateAge() {
  let userInput = document.getElementById("date").value;
  document.getElementById("date").max = new Date().toISOString().split("T")[0];
  var today = new Date();
  var birthDate = new Date(userInput);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  var d = today.getDate() - birthDate.getDate();
  if (m < 0 || (m === 0 && d < 0)) {
    age--;
    m += 12;
  }

  var ageString = age + " years";
  if (m > 0) {
    ageString += ", " + m + " months";
  }
  if (d > 0) {
    ageString += ", " + d + " days";
  }

  document.getElementById("result").innerHTML = "Your age is: " + ageString;
}
