document.addEventListener("DOMContentLoaded", function() {
  // Get all list items
  var listItems = document.querySelectorAll(".list-group-item");

  // Add click event listener to each list item
  listItems.forEach(function(item) {
    item.addEventListener("click", function() {
      // Get the URL from the data-href attribute
      var url = this.getAttribute("data-href");
      
      // If a URL is present, navigate to it
      if (url) {
        window.location.href = url;
      }
    });
  });
});