const router = require("express").Router();
const db = require("../db");

function match(u, j) {
  let us = u.toLowerCase().split(",");
  let js = j.toLowerCase().split(",");

  let m = us.filter(s => js.includes(s));
  return Math.round((m.length / js.length) * 100);
}

router.get("/:id", (req, res) => {
  db.query("SELECT * FROM users WHERE id=?", [req.params.id], (err, user) => {
    let skills = user[0].skills;

    db.query("SELECT * FROM jobs", (err, jobs) => {
      let data = jobs.map(job => ({
        ...job,
        match: match(skills, job.skills_required)
      }));

      res.json(data.sort((a,b)=>b.match-a.match));
    });
  });
});

module.exports = router;