const con = require("../connections/db");
const argon2 = require("argon2");

exports.getHome = (req, res) => {
  res.render("sbst-home.ejs", { title: "Home Page" });
};

exports.getSched = (req, res) => {
  const sql = "SELECT * FROM course";
  con.query(sql, (err, result) => {
    if (err) {
      console.log(err.message);
      req.flash("error", err.message);
    }
    res.render("sbst-sched.ejs", { title: "Sched Page", result });
  });
};

exports.getAbout = (req, res) => {
  res.render("sbst-about.ejs", { title: "About Page" });
};

exports.getApply = (req, res) => {
  res.render("sbst-apply.ejs", { title: "Apply Page" });
};

exports.getEnroll = (req, res) => {
  const degId = req.query.deg_id;

  const degreeSql = "SELECT id, deg_name FROM degree"; // for dropdown
  let courseSql = `
        SELECT 
            degree.deg_name, 
            course.course_name, 
            course.unit, 
            course.instructor, 
            course.day, 
            course.time
        FROM course
        JOIN degree ON course.deg_id = degree.id
    `;
  const params = [];

  if (degId) {
    courseSql += " WHERE degree.id = ?";
    params.push(degId);
  }

  // First get all degrees
  con.query(degreeSql, (err, degrees) => {
    if (err) {
      console.log(err.message);
      req.flash("error", err.message);
    }

    // Then get filtered courses
    con.query(courseSql, params, (err2, courses) => {
      if (err2) {
        console.log(err2.message);
        req.flash("error", err2.message);
      }

      res.render("sbst-enroll.ejs", {
        title: "Enroll Page",
        degrees,
        courses,
        selectedDeg: degId || null,
      });
    });
  });
};

exports.getDegrees = (req, res) => {
  const sql = "SELECT id, deg_name FROM degree";
  con.query(sql, (err, degrees) => {
    if (err) {
      console.log(err.message);
      req.flash("error", err.message);
    }
    res.render("sbst-enroll.ejs", {
      title: "Enroll Page",
      degrees,
      courses: [], // empty on initial load
      selectedDeg: null,
    });
  });
};

exports.getCourses = (req, res) => {
  const degId = req.query.deg_id;

  const sql = `
    SELECT course.id, course.course_name, course.unit, course.instructor, course.day, course.time
    FROM course
    WHERE course.deg_id = ?`;

  con.query(sql, [degId], (err, courses) => {
    if (err) {
      console.log("DB error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    // ✅ always send JSON for AJAX
    return res.json({ courses });
  });
};

exports.getAdmin = (req, res) => {
  res.render("admin/sbst-admin.ejs", { title: "Admin Page" });
};

exports.getUser = (req, res) => {
  res.render("admin/sbst-user.ejs", { title: "User Page" });
};

// Enrollment Form Submission
exports.addEnroll = (req, res) => {
  const {
    fname,
    lname,
    age,
    gender,
    civilstatus,
    educ,
    address,
    email,
    number,
    religion,
    church,
    churchaddr,
    ministry,
    degree,
    regfee,
    tuition,
    idcard,
    thesis,
    misc,
    total_fee,
  } = req.body;

  // ✅ Convert safely
  const safeRegfee = parseFloat(regfee);
  const safeTuition = parseFloat(tuition);
  const safeIdcard = parseFloat(idcard) || 150; // default 150
  const safeThesis = parseFloat(thesis) || 0;
  const safeMisc = parseFloat(misc) || 300; // default 300

  // ✅ Validation checks
  if (!fname || !lname || !email || !number || !degree) {
    req.flash("error", "Required fields are missing!");
    return res.redirect("/sbst-enroll");
  }

  if (isNaN(safeRegfee) || isNaN(safeTuition)) {
    req.flash("error", "Registration fee and Tuition must be numbers!");
    return res.redirect("/sbst-enroll");
  }

  // ✅ Final total (use passed value OR recompute)
  let finalTotal =
    parseFloat(total_fee) ||
    safeRegfee + safeTuition + safeIdcard + safeThesis + safeMisc;

  if (finalTotal <= 0) {
    req.flash("error", "Total fee cannot be zero or negative!");
    return res.redirect("/sbst-enroll");
  }

  // ✅ Insert query
  const sql =
    "INSERT INTO enrollment (fname, lname, age, gender, civilstat, educ, addr, email, num, religion, church, churchaddr, ministry, degree_id, regfee, tuition, idcard, thesis, misc, total_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  con.query(
    sql,
    [
      fname,
      lname,
      age,
      gender,
      civilstatus,
      educ,
      address,
      email,
      number,
      religion,
      church,
      churchaddr,
      ministry,
      degree,
      safeRegfee,
      safeTuition,
      safeIdcard,
      safeThesis,
      safeMisc,
      finalTotal,
    ],
    (err, result) => {
      if (err) {
        console.log(err.message);
        req.flash("error", err.message);
        return res.redirect("/sbst-enroll");
      }

      const enrollmentId = result.insertId;
      const courseIds = req.body.course_ids || [];

      if (courseIds.length > 0) {
        const values = courseIds.map((cid) => [enrollmentId, cid]);
        const sql2 =
          "INSERT INTO enrollment_courses (enrollment_id, course_id) VALUES ?";
        con.query(sql2, [values], (err2) => {
          if (err2) {
            console.log(err2.message);
            req.flash("error", "Enrollment saved, but courses failed!");
          } else {
            req.flash("success", "You are successfully enrolled!");
          }
          res.redirect("/sbst-enroll");
        });
      } else {
        req.flash("success", "You are Enrolled (no courses selected)!");
        res.redirect("/sbst-enroll");
      }
    },
  );
};

// exports.addEnroll = (req, res) => {
//   const {
//     fname,
//     lname,
//     age,
//     gender,
//     civilstatus,
//     educ,
//     address,
//     email,
//     number,
//     religion,
//     church,
//     churchaddr,
//     ministry,
//     degree,
//     regfee,
//     tuition,
//     idcard,
//     thesis,
//     misc,
//     total_fee,
//   } = req.body;

//   const courseIds = req.body.course_ids || []; // ✅ from checkboxes

//   // insert student info + degree
//   const sql =
//     "INSERT INTO enrollment (fname, lname, age, gender, civilstat, educ, addr, email, num, religion, church, churchaddr, ministry, degree_id, regfee, tuition, idcard, thesis, misc, total_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

//   con.query(
//     sql,
//     [
//       fname,
//       lname,
//       age,
//       gender,
//       civilstatus,
//       educ,
//       address,
//       email,
//       number,
//       religion,
//       church,
//       churchaddr,
//       ministry,
//       degree, // ✅ add degree foreign key here
//       regfee,
//       tuition,
//       idcard,
//       thesis,
//       misc,
//       total_fee,
//     ],
//     (err, result) => {
//       if (err) {
//         console.log(err.message);
//         req.flash("error", err.message);
//         return res.redirect("/sbst-enroll");
//       }

//       const enrollmentId = result.insertId;

//       // insert selected courses
//       if (courseIds.length > 0) {
//         const values = courseIds.map((cid) => [enrollmentId, cid]);
//         const sql2 =
//           "INSERT INTO enrollment_courses (enrollment_id, course_id) VALUES ?";
//         con.query(sql2, [values], (err2) => {
//           if (err2) {
//             console.log(err2.message);
//             req.flash("error", "Enrollment saved, but courses failed!");
//           } else {
//             req.flash("success", "You are successfully enrolled!");
//           }
//           res.redirect("/sbst-enroll");
//         });
//       } else {
//         req.flash("success", "You are Enrolled (no courses selected)!");
//         res.redirect("/sbst-enroll");
//       }
//     }
//   );
// };
