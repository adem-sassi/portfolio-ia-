import app from "./app.js";
import { connectDB } from "./db/connect.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`🚀 API locale sur http://localhost:${PORT}`)))
  .catch(err => { console.error("Erreur démarrage:", err.message); process.exit(1); });
