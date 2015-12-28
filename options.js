document.querySelector("form").addEventListener("submit", function(event) {
  event.preventDefault();
  chrome.storage.sync.set({
    kill_under_amount: document.querySelector("#kill_under_amount").value,
    kill_under_type: document.querySelector("#kill_under_type").value,
    kill_every_amount: document.querySelector("#kill_every_amount").value,
    kill_every_type: document.querySelector("#kill_every_type").value,
    kill_time_amount: document.querySelector("#kill_time_amount").value,
    kill_time_type: document.querySelector("#kill_time_type").value,
  }, function() {
    document.querySelector("input[type='submit']").value = "Saved sucessfully";
    setTimeout(function() { document.querySelector("input[type='submit']").value = "Save" }, 2000);
  });
});

function options() { 
  chrome.storage.sync.get({
    kill_under_amount: 25,
    kill_under_type: "%",
    kill_every_amount: 1,
    kill_every_type: 'minutes',
    kill_time_amount: 10,
    kill_time_type: 'minutes',
  }, function(items) {
    document.querySelector("#kill_under_amount").value = items.kill_under_amount;
    document.querySelector("#kill_under_type").value = items.kill_under_type;
    document.querySelector("#kill_every_amount").value = items.kill_every_amount;
    document.querySelector("#kill_every_type").value = items.kill_every_type;
    document.querySelector("#kill_time_amount").value = items.kill_time_amount;
    document.querySelector("#kill_time_type").value = items.kill_time_type;
  });
}

window.addEventListener("load", options);
