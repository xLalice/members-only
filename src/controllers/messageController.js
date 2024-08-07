const pool = require("../db/pool");

exports.getCreateMessage = (req, res) => {
  res.render("create-message", {user: req.user});
};

exports.createMessage = async (req, res) => {
  const { title, content } = req.body;
  try {
    await pool.query(
      "INSERT INTO messages (title, content, user_id) VALUES ($1, $2, $3)",
      [title, content, req.user.id] 
    );
    res.redirect("/")
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating message", error: error.message });
  }
};

exports.getHomePage = async (req, res) => {
  try {
    const results = await pool.query(
      `SELECT m.id, m.content, m.created_at, u.id AS user_id, u.first_name, u.last_name 
                FROM messages m
                JOIN users u ON m.user_id = u.id
                ORDER BY m.created_at DESC
        `
    );
    console.log("User object:", req.user);

    const formattedMessages = results.rows.map((message) => ({
      id: message.id,
      title: message.title,
      content: message.content,
      createdAt: message.created_at,
      author:
        req.user && (req.user.is_member || req.user.is_admin)
          ? `${message.first_name} ${message.last_name}`
          : "Anon",
    }));

    res.render("home", { messages: formattedMessages, user: req.user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params.id;
    const result = await pool.query(
      "DELETE FROM messages WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ message: "Message not exists" });
    }
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting message", error: error.message });
  }
};
