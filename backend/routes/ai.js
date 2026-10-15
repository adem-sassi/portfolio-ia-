import express from "express";
import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";
import Content from "../models/Content.js";
import Article from "../models/Article.js";

const router = express.Router();
const MODEL = "openai/gpt-oss-120b";
const getClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Génère le system prompt depuis MongoDB ────────────────────────────────────
async function buildSystemPrompt() {

  // Articles blog
  let blogArticles = "";
  try {
    const articles = await Article.find({ published: true });
    if (articles.length > 0) {
      blogArticles = "\n\nARTICLES DU BLOG D'ADEM:\n" + articles.map(a =>
        `- "${a.title}": ${a.excerpt} [Tags: ${(a.tags||[]).join(", ")}]`
      ).join("\n");
    }
  } catch(e) {}

  try {
    const sections = await Content.find({});
    const data = {};
    sections.forEach(s => { data[s.section] = s.data; });

    const hero = data.hero || {};
    const about = data.about || {};
    const skills = data.skills || [];
    const projects = data.projects || [];
    const contact = data.contact || {};
    const techs = data.techs || [];
    const testimonials = data.testimonials || [];

    const skillsList = skills.map(cat =>
      `${cat.category}: ${(cat.items || []).map(s => `${s.name} (${s.level}%)`).join(", ")}`
    ).join("\n");

    const projectsList = projects.map(p =>
      `- ${p.title}: ${p.desc} | Tags: ${(p.tags || []).join(", ")} | GitHub: ${p.github} | Démo: ${p.demo}`
    ).join("\n");

    const techList = techs.map(t => t.label).join(", ");

    const timeline = (about.timeline || []).map(t =>
      `- ${t.year} : ${t.title} chez ${t.place} — ${t.desc}`
    ).join("\n");

    const testimonialsList = testimonials.map(t =>
      `- ${t.name} (${t.role}) : "${t.text}"`
    ).join("\n");

    return `Tu es l'assistant IA personnel de ${hero.name || "ce développeur"}.
Tu réponds UNIQUEMENT en français, de façon claire, concise et professionnelle.
Tu utilises UNIQUEMENT les informations ci-dessous pour répondre aux questions sur le portfolio.

=== PRÉSENTATION ===
Nom : ${hero.name || ""}
${about.paragraphs ? about.paragraphs.join(" ") : ""}

=== CONTACT ===
Email : ${contact.email || ""}
GitHub : ${contact.github || ""}
LinkedIn : ${contact.linkedin || ""}
Disponibilité : ${contact.available ? "✅ " + (contact.availabilityText || "Disponible") : "❌ Non disponible"}

=== FORMATION & PARCOURS ===
${timeline}

=== COMPÉTENCES ===
${skillsList}

=== TECHNOLOGIES ===
${techList}

=== PROJETS ===
${projectsList}

=== RECOMMANDATIONS ===
${testimonialsList}

=== COMMENT RÉPONDRE ===
Tu parles d'Adem à la 3e personne, comme un collègue sympa qui le connaît bien. Tu vouvoies le visiteur. Ton naturel, chaleureux, jamais robotique.

Format :
- Réponses COURTES : 2 à 4 phrases, ou une petite liste de 6 puces maximum. Environ 80 mots, sauf si on te demande explicitement du détail.
- JAMAIS de tableau. JAMAIS de titre (#). Pas de pavé.
- Pour lister des projets : une puce par projet au format "**Nom** : une phrase courte". Puis propose d'en détailler un.
- Un lien seulement s'il est utile, au format markdown [texte](url), jamais d'URL brute, jamais le même lien répété.
- Tu peux finir par une courte question de relance, mais pas à chaque fois.

Quand l'info n'est pas dans le profil :
- N'écris JAMAIS "je ne dispose pas", "le profil fourni", "les informations fournies", "le contexte" ou "je n'ai pas accès".
- Réponds comme un humain : dis simplement qu'Adem n'a pas partagé ce détail ici, rebondis sur une info proche et utile si tu en as une, puis propose de lui écrire à ${contact.email || "son email"} ou via le formulaire de contact.
- Exemple pour "quel âge a Adem ?" : "Adem n'a pas mis son âge sur le site 🙂 Ce que je peux vous dire, c'est qu'il est en Master 2 Data & IA et en alternance chez ACENSI. Pour le reste, le plus simple est de lui écrire à ${contact.email || "son email"}."
- N'invente jamais rien.

Autres règles :
- Réponds dans la langue du visiteur : en anglais s'il écrit en anglais, sinon en français.
- Hors sujet : recentre en une phrase sympa vers le parcours, les projets ou les compétences d'Adem.
- Opportunité pro : invite à écrire à ${contact.email || "son email"}.
- L'École Hexagone est à Versailles.
${blogArticles}`;
  } catch (err) {
    console.error("buildSystemPrompt error:", err);
    return "Tu es l'assistant IA d'un portfolio de développeur. Réponds en français.";
  }
}


// ── Nettoie la réponse : tableaux markdown -> puces, titres -> gras ──
function tidyReply(txt = "") {
  const out = [];
  let head = null;
  for (const line of String(txt).split("\n")) {
    const t = line.trim();
    if (/^\|.*\|$/.test(t)) {
      const cells = t.slice(1, -1).split("|").map((c) => c.trim());
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
      if (!head) { head = cells; continue; }
      const rest = cells.slice(1).filter((c) => c && c !== "–" && c !== "-" && !/^https?:\/\/\S+$/.test(c));
      out.push(`- **${cells[0]}** : ${rest[0] || ""}`.trim());
      continue;
    }
    head = null;
    out.push(line.replace(/^#{1,6}\s+(.*)$/, "**$1**"));
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { messages, lang } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Format invalide" });
    }

    // Génère le prompt depuis MongoDB à chaque requête
    const systemPrompt = await buildSystemPrompt();

    const r = await getClient().chat.completions.create({
      model: MODEL, reasoning_effort: "low",
      max_tokens: 600,
      temperature: 0.6,
      messages: [
        { role: "system", content: systemPrompt + (lang === "en" ? "\n\nIMPORTANT : le visiteur consulte le site en anglais. Réponds en anglais (vouvoiement inutile), avec le même style court et naturel." : "") },
        ...messages.slice(-12),
      ],
    });

    res.json({ reply: tidyReply(r.choices[0].message.content) });
  } catch (e) {
    console.error("Chat error:", e.message);
    res.status(500).json({ error: "Erreur du service IA" });
  }
});

// ── POST /api/ai/analyze-text ─────────────────────────────────────────────────
router.post("/analyze-text", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.length < 5) return res.status(400).json({ error: "Texte trop court" });
    const r = await getClient().chat.completions.create({
      model: MODEL, reasoning_effort: "low", max_tokens: 512,
      messages: [{ role: "user", content: `Analyse ce texte, retourne UNIQUEMENT un JSON valide sans markdown:\n{"sentiment":"positive","score":0.5,"emotions":["joie"],"tone":"professionnel","summary":"résumé"}\nTexte: "${text}"` }],
    });
    res.json(JSON.parse(r.choices[0].message.content.trim().replace(/```json|```/g, "").trim()));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/ai/review-code ──────────────────────────────────────────────────
router.post("/review-code", async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) return res.status(400).json({ error: "Aucun code fourni" });
    const r = await getClient().chat.completions.create({
      model: MODEL, reasoning_effort: "low", max_tokens: 1024,
      messages: [{ role: "user", content: `Review ce code ${language||""}, retourne UNIQUEMENT un JSON valide sans markdown:\n{"score":80,"issues":[{"severity":"warning","message":"problème"}],"suggestions":["suggestion"],"complexity":"medium","summary":"évaluation"}\nCode:\n${code}` }],
    });
    res.json(JSON.parse(r.choices[0].message.content.trim().replace(/```json|```/g, "").trim()));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/ai/generate-bio ─────────────────────────────────────────────────
router.post("/generate-bio", async (req, res) => {
  try {
    const { name, skills, interests, style } = req.body;
    const r = await getClient().chat.completions.create({
      model: MODEL, reasoning_effort: "low", max_tokens: 600,
      messages: [{ role: "user", content: `Écris une bio portfolio en français. Nom: ${name||"l'étudiant"}, Compétences: ${skills?.join(",")||"ML,DL,NLP"}, Intérêts: ${interests?.join(",")||"IA"}, Style: ${style||"professionnel"}. Écris 2-3 paragraphes percutants.` }],
    });
    res.json({ bio: r.choices[0].message.content });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/ai/quiz ─────────────────────────────────────────────────────────
router.post("/quiz", async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    const r = await getClient().chat.completions.create({
      model: MODEL, reasoning_effort: "low", max_tokens: 1200,
      messages: [{ role: "user", content: `Génère un quiz en français sur "${topic||"IA"}" niveau ${difficulty||"intermédiaire"}. Retourne UNIQUEMENT un JSON valide sans markdown:\n{"topic":"sujet","questions":[{"question":"?","options":["A","B","C","D"],"correct":0,"explanation":"explication"}]}\nGénère exactement 5 questions.` }],
    });
    res.json(JSON.parse(r.choices[0].message.content.trim().replace(/```json|```/g, "").trim()));
  } catch (e) { res.status(500).json({ error: e.message }); }
});


// ── ML: Analyse sentiment avancée ─────────────────────────────────────────
router.post("/ml/sentiment", async (req, res) => {
  try {
    const { text } = req.body;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Analyse le sentiment de ce texte et réponds UNIQUEMENT en JSON valide:
{"sentiment": "positif|negatif|neutre", "score": 0.0-1.0, "emotions": ["joie", "colere", etc], "mots_cles": ["mot1", "mot2"], "explication": "courte explication"}
Texte: "${text}"`
      }],
      max_tokens: 300,
    });
    const raw = completion.choices[0].message.content.trim();
    const json = raw.replace(/\`\`\`json|\`\`\`/g, '').trim();
    res.json(JSON.parse(json));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ML: Prédiction de données ──────────────────────────────────────────────
router.post("/ml/predict", async (req, res) => {
  try {
    const { data, context } = req.body;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Tu es un expert en analyse de données. Analyse ces données et prédit les prochaines valeurs.
Réponds UNIQUEMENT en JSON valide:
{"tendance": "hausse|baisse|stable", "predictions": [val1, val2, val3], "confiance": 0-100, "analyse": "explication", "facteurs": ["facteur1", "facteur2"]}
Données: ${JSON.stringify(data)}
Contexte: ${context || "données temporelles"}`
      }],
      max_tokens: 400,
    });
    const raw = completion.choices[0].message.content.trim();
    const json = raw.replace(/\`\`\`json|\`\`\`/g, '').trim();
    res.json(JSON.parse(json));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ML: Classification image ───────────────────────────────────────────────
router.post("/ml/classify-image", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    const completion = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` }},
          { type: "text", text: `Analyse cette image et réponds UNIQUEMENT en JSON valide:
{"objet_principal": "nom", "categorie": "catégorie", "confiance": 0-100, "description": "description détaillée", "tags": ["tag1", "tag2", "tag3"], "couleurs": ["couleur1", "couleur2"]}` }
        ]
      }],
      max_tokens: 400,
    });
    const raw = completion.choices[0].message.content.trim();
    const json = raw.replace(/\`\`\`json|\`\`\`/g, '').trim();
    res.json(JSON.parse(json));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ML: Détection anomalies ────────────────────────────────────────────────
router.post("/ml/anomalies", async (req, res) => {
  try {
    const { data } = req.body;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Tu es un expert en détection d'anomalies. Analyse ces données et identifie les anomalies.
Réponds UNIQUEMENT en JSON valide:
{"anomalies": [{"index": 0, "valeur": 0, "raison": "explication"}], "statistiques": {"moyenne": 0, "ecart_type": 0, "min": 0, "max": 0}, "score_anomalie": 0-100, "recommandation": "conseil"}
Données: ${JSON.stringify(data)}`
      }],
      max_tokens: 500,
    });
    const raw = completion.choices[0].message.content.trim();
    const json = raw.replace(/\`\`\`json|\`\`\`/g, '').trim();
    res.json(JSON.parse(json));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ML: Clustering de textes ───────────────────────────────────────────────
router.post("/ml/cluster", async (req, res) => {
  try {
    const { texts } = req.body;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Tu es un expert en NLP. Regroupe ces textes par thèmes similaires (clustering).
Réponds UNIQUEMENT en JSON valide:
{"clusters": [{"id": 0, "theme": "nom du thème", "textes": [0, 1], "mots_cles": ["mot1", "mot2"]}], "nb_clusters": 0, "analyse": "explication globale"}
Textes: ${JSON.stringify(texts)}`
      }],
      max_tokens: 600,
    });
    const raw = completion.choices[0].message.content.trim();
    const json = raw.replace(/\`\`\`json|\`\`\`/g, '').trim();
    res.json(JSON.parse(json));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
