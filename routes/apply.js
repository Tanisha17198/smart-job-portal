const router = require("express").Router();
const db = require("../db");

router.post("/", (req, res) => {
  const { user_id, job_id } = req.body;

  db.query(
    "INSERT INTO applications (user_id,job_id,status) VALUES (?,?,?)",
    [user_id, job_id, "Applied"],
    () => res.send("Applied")
  );
});

module.exports = router;