const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const cancelBtn = document.getElementById("cancelBtn");

let debounceTimer;

searchInput.addEventListener("input", function () {

  const value = searchInput.value.trim();

  if(value.length > 0){
    clearBtn.classList.remove("hidden");
    cancelBtn.classList.remove("hidden");
  }else{
    clearBtn.classList.add("hidden");
    cancelBtn.classList.add("hidden");
  }

  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(()=>{

    const query = searchInput.value.trim();

    window.location.href = `/admin/userManagement?search=${query}`;

  },500);

});

clearBtn.addEventListener("click", function(){

  searchInput.value = "";

  window.location.href = "/admin/userManagement";

});

cancelBtn.addEventListener("click", function(){

  searchInput.value = "";

  window.location.href = "/admin/userManagement";

});