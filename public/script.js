function myFunction() {
  var x = document.getElementById("slideone")
  var y = document.getElementById("slidetwo")

  if (x.style.display === "block") {
    x.style.display = "none";
    y.style.display = "block";
  } else if (y.style.display === "block"){
    x.style.display = "block";
    y.style.display = "none";
  } else if (x.style.display === "none") {
    x.style.display = "block";
    y.style.display = "none";
  } else {
    x.style.display = "none";
    y.style.display = "block";
  } 
}

function bigImg(x) {
  x.style.height = "220px";
  x.style.width = "25%";
}

function normalImg(x) {
  x.style.height = "200px";
  x.style.width = "24%";
}