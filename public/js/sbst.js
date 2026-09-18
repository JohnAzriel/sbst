// Script for Navbar
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".nav-link.ajax-link").forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      let page = this.getAttribute("data-page");
      let newUrl = `/${page}`;

      // Update the URL
      window.history.pushState({ path: newUrl }, "", newUrl);

      // Fetch and update page content
      fetch(newUrl)
        .then((response) => response.text())
        .then((html) => {
          document.open();
          document.write(html);
          document.close();
        })
        .catch((error) => console.error("Error loading page:", error));
    });
  });
});

// Script for updating page title dynamically
document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      let pageTitle = this.textContent.trim();
      document.title = `SBST - ${pageTitle}`;
    });
  });
});

// Function to dismiss the alert after 3 seconds
function dismissAlert() {
  var alertDiv = document.getElementById("myAlert");
  if (alertDiv) {
    setTimeout(function () {
      alertDiv.style.display = "none";
    }, 2500);
  }
}

// Call the dismissAlert function when the page loads
window.onload = function () {
  dismissAlert();
};

// DataTable for Degree and Course Selection
document.addEventListener("DOMContentLoaded", function () {
  const degreeSelect = document.getElementById("degreeSelect");
  const courseTableBody = document.querySelector("#courseTable tbody");

  degreeSelect.addEventListener("change", function () {
    const selectedValue = this.value;
    if (!selectedValue) return;

    // Fetch courses without full page reload
    fetch(`/courses?deg_id=${selectedValue}`)
      .then((response) => response.json())
      .then((data) => {
        courseTableBody.innerHTML = "";

        if (data.courses.length > 0) {
          data.courses.forEach((course) => {
            const row = `
              <tr>
                <td>${course.course_name}</td>
                <td>${course.unit}</td>
                <td>${course.instructor}</td>
                <td>${course.day}</td>
                <td>${course.time}</td>
                <td><input type="checkbox" name="course_ids[]" value="${course.id}"></td>
              </tr>`;
            courseTableBody.insertAdjacentHTML("beforeend", row);
          });
        } else {
          courseTableBody.innerHTML = `
            <tr>
              <td colspan="6" class="text-muted">No courses found for this degree</td>
            </tr>`;
        }
      })
      .catch((err) => {
        console.error("Error loading courses:", err);
        courseTableBody.innerHTML = `
          <tr><td colspan="6" class="text-danger">Error loading courses</td></tr>`;
      });
  });
});

// compute the fees
document.addEventListener("DOMContentLoaded", () => {
  const regfeeInput = document.getElementById("regfee");
  const tuitionInput = document.getElementById("tuition");
  const idcardInput = document.getElementById("idcard");
  const thesisInput = document.getElementById("thesis");
  const miscInput = document.getElementById("misc");

  const totalDisplay = document.getElementById("total_display");
  const totalInput = document.getElementById("total_fee");
  const courseTable = document.getElementById("courseTable");

  const TUITION_PER_UNIT = 300;

  // ✅ Set constant values
  idcardInput.value = 150;
  miscInput.value = 300;

  // ✅ Create “Total Units Selected” label below the course table
  const totalUnitsLabel = document.createElement("div");
  totalUnitsLabel.id = "totalUnitsLabel";
  totalUnitsLabel.style.textAlign = "right";
  totalUnitsLabel.style.fontWeight = "600";
  totalUnitsLabel.style.marginTop = "8px";
  totalUnitsLabel.textContent = "Total Units Selected: 0";
  courseTable.parentElement.appendChild(totalUnitsLabel);

  // ✅ Function to calculate tuition from checked courses
  function calculateTuitionFromCourses() {
    const courseCheckboxes = courseTable.querySelectorAll(
      'input[name="course_ids[]"]',
    );
    let totalUnits = 0;

    courseCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const row = checkbox.closest("tr");
        const unitCell = row.querySelector("td:nth-child(2)");
        const units = parseFloat(unitCell.textContent) || 0;
        totalUnits += units;
      }
    });

    if (totalUnits > 0) {
      tuitionInput.value = totalUnits * TUITION_PER_UNIT;
    } else {
      tuitionInput.value = "";
    }

    // ✅ Update total units label
    totalUnitsLabel.textContent = `Total Units Selected: ${totalUnits}`;
  }

  // ✅ Function to calculate total fees
  function calculateTotal() {
    const regfee = parseFloat(regfeeInput.value) || 0;
    const tuition = parseFloat(tuitionInput.value) || 0;
    const thesis = parseFloat(thesisInput.value) || 0;
    const idcard = 150;
    const misc = 300;

    const total = regfee + tuition + thesis + idcard + misc;

    totalDisplay.value = total > 0 ? total.toLocaleString() : "";
    totalInput.value = total;
  }

  // ✅ Listen for checkbox changes using event delegation
  courseTable.addEventListener("change", (event) => {
    if (event.target.matches('input[name="course_ids[]"]')) {
      calculateTuitionFromCourses();
      calculateTotal();
    }
  });

  // ✅ Listen for manual fee input changes
  [regfeeInput, tuitionInput, thesisInput].forEach((input) => {
    input.addEventListener("input", calculateTotal);
  });

  // ✅ Initial calculation when page loads
  calculateTuitionFromCourses();
  calculateTotal();
});

// document.addEventListener("DOMContentLoaded", () => {
//   const regfeeInput = document.getElementById("regfee");
//   const tuitionInput = document.getElementById("tuition");
//   const idcardInput = document.getElementById("idcard");
//   const thesisInput = document.getElementById("thesis");
//   const miscInput = document.getElementById("misc");

//   const totalDisplay = document.getElementById("total_display"); // shows ₱
//   const totalInput = document.getElementById("total_fee"); // hidden raw value

//   // ✅ Set constant values
//   idcardInput.value = 150;
//   miscInput.value = 300;

//   function calculateTotal() {
//     let regfee = parseFloat(regfeeInput.value) || 0;
//     let tuition = parseFloat(tuitionInput.value) || 0;
//     let thesis = parseFloat(thesisInput.value) || 0;
//     let idcard = 150;
//     let misc = 300;

//     let total = regfee + tuition + thesis + idcard + misc;

//     // ✅ Show formatted for user
//     totalDisplay.value = "" + total.toLocaleString();

//     // ✅ Keep raw number for DB
//     totalInput.value = total;
//   }

//   // Trigger calculation when typing
//   [regfeeInput, tuitionInput, thesisInput].forEach((input) => {
//     input.addEventListener("input", calculateTotal);
//   });

//   // Run once on page load
//   calculateTotal();
// });

// for modal message
