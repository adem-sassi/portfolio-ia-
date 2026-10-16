// Génère le PDF du CV dans le navigateur (vrai texte sélectionnable, identique sur Safari, Chrome, mobile).
import { Document, Page, View, Text, Image, Link, Svg, Path, Circle, Rect, StyleSheet, pdf } from "@react-pdf/renderer";

const C = { side: "#0f1626", side2: "#0b111d", main: "#0a0e1a", cy: "#00D4FF", cy2: "#2bd9ff", tx: "#E8EEF8", dim: "#aab6cc", mute: "#7f8aa3", line: "#1c2638", tagb: "#12324a", tagbg: "#0d1d2e", feat: "#0e1628" };
// police standard PDF : on remplace les rares caractères hors Latin-1
const clean = (s) => String(s ?? "").replace(/[→⇒➜]/g, "›").replace(/[←]/g, "‹").replace(/[✓✔]/g, "•").replace(/[▹▸]/g, "›").replace(/[^\u0000-ÿŒœŠšŸŽžƒˆ˜–—‘’‚“”„†‡•…‰‹›€™]/g, "");
const s = StyleSheet.create({
  page: { flexDirection: "row", backgroundColor: C.main, fontFamily: "Helvetica", fontSize: 8.6, color: C.dim, lineHeight: 1.42 },
  side: { width: 186, backgroundColor: C.side, paddingTop: 24, paddingHorizontal: 17, paddingBottom: 16, borderRightWidth: 0.6, borderRightColor: C.line },
  main: { flex: 1, paddingTop: 22, paddingHorizontal: 22, paddingBottom: 14 },
  ring: { alignSelf: "center", width: 104, height: 104, borderRadius: 52, backgroundColor: C.cy, padding: 3 },
  photo: { width: 98, height: 98, borderRadius: 49, objectFit: "cover" },
  name: { marginTop: 12, textAlign: "center", fontFamily: "Helvetica-Bold", fontSize: 18.5, lineHeight: 1.15, color: "#ffffff" },
  role: { marginTop: 5, lineHeight: 1.2, textAlign: "center", fontFamily: "Helvetica-Bold", fontSize: 7, letterSpacing: 1.4, color: C.cy },
  bar: { alignSelf: "center", width: 28, height: 2, borderRadius: 2, backgroundColor: C.cy, marginTop: 9, marginBottom: 2 },
  sh: { flexDirection: "row", alignItems: "center", marginTop: 15, marginBottom: 7 },
  shT: { fontFamily: "Helvetica-Bold", fontSize: 7.2, letterSpacing: 1.6, color: "#ffffff" },
  shE: { fontFamily: "Helvetica-Bold", fontSize: 7.2, letterSpacing: 1.6, color: C.cy },
  shL: { flex: 1, height: 0.6, backgroundColor: C.line, marginLeft: 7 },
  ct: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  ctT: { fontSize: 8.2, color: C.dim },
  stH: { fontFamily: "Helvetica-Bold", fontSize: 6.8, letterSpacing: 0.9, color: C.cy, marginBottom: 4 },
  tags: { flexDirection: "row", flexWrap: "wrap", marginBottom: 7 },
  tag: { borderWidth: 0.6, borderColor: C.tagb, backgroundColor: C.tagbg, borderRadius: 3, paddingVertical: 1.6, paddingHorizontal: 5, marginRight: 3.5, marginBottom: 3.5, fontSize: 7.4, color: C.tx },
  lg: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  lgT: { flex: 1, fontSize: 8.2 },
  lgBar: { width: 62, height: 3.4, borderRadius: 2, backgroundColor: "#1a2233" },
  q: { flexDirection: "row", marginBottom: 4, fontSize: 8.2 },
  intro: { borderLeftWidth: 1.6, borderLeftColor: C.cy, paddingLeft: 11, marginBottom: 4 },
  introT: { fontSize: 8.9, lineHeight: 1.55, color: C.dim },
  obj: { fontSize: 8.9, lineHeight: 1.55, color: C.cy2, marginTop: 5 },
  h: { flexDirection: "row", alignItems: "center", borderBottomWidth: 0.6, borderBottomColor: C.line, paddingBottom: 5, marginTop: 13, marginBottom: 7 },
  hT: { fontFamily: "Helvetica-Bold", fontSize: 12.5, lineHeight: 1.15, color: "#ffffff" },
  hE: { fontFamily: "Helvetica-Bold", fontSize: 6.4, lineHeight: 1, letterSpacing: 1.3, color: C.cy, marginLeft: 7, marginTop: 2 },
  it: { marginBottom: 8 },
  itH: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itT: { flex: 1, fontFamily: "Helvetica-Bold", fontSize: 9.3, color: "#ffffff", paddingRight: 8 },
  itP: { fontFamily: "Helvetica", color: C.cy },
  time: { fontFamily: "Helvetica-Bold", fontSize: 7, color: C.mute },
  bl: { flexDirection: "row", marginTop: 2.4, paddingLeft: 2 },
  dot: { width: 3.4, height: 3.4, borderRadius: 1.7, backgroundColor: C.cy, marginTop: 3.6, marginRight: 6 },
  blT: { flex: 1, fontSize: 8.3, color: C.dim },
  feat: { borderWidth: 0.8, borderColor: "#155a78", backgroundColor: C.feat, borderRadius: 6, paddingVertical: 9, paddingHorizontal: 12, marginBottom: 9 },
  featH: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  featT: { fontFamily: "Helvetica-Bold", fontSize: 9.6, color: "#ffffff" },
  badge: { marginLeft: 7, backgroundColor: C.cy, color: C.main, fontFamily: "Helvetica-Bold", fontSize: 5.6, lineHeight: 1, letterSpacing: 0.8, paddingTop: 2.2, paddingBottom: 1.2, paddingHorizontal: 4, borderRadius: 2 },
  featL: { marginLeft: "auto", fontFamily: "Helvetica-Bold", fontSize: 7, color: C.mute, textDecoration: "none" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  cell: { width: "48%", marginBottom: 7 },
  cellT: { fontFamily: "Helvetica-Bold", fontSize: 8.6, color: "#ffffff", marginBottom: 1 },
  cellP: { fontSize: 7.7, color: C.mute, lineHeight: 1.4 },
  eduP: { fontSize: 8.3, color: C.dim, marginTop: 1.5 },
  foot: { position: "absolute", bottom: 9, left: 210, right: 22, textAlign: "right", fontSize: 6, color: "#4f5a72" },
});

const Rich = ({ children, style, bold = "#E8EEF8" }) => (
  <Text style={style}>{clean(children).split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <Text key={i} style={{ fontFamily: "Helvetica-Bold", color: bold }}>{p.slice(2, -2)}</Text> : p))}</Text>
);
const ICON = {
  mail: <><Rect x="3" y="5" width="18" height="14" rx="2" /><Path d="M3 7l9 6 9-6" /></>,
  phone: <Path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  pin: <><Path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><Circle cx="12" cy="10" r="2.5" /></>,
  web: <><Circle cx="12" cy="12" r="9" /><Path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  in: <><Rect x="3" y="3" width="18" height="18" rx="3" /><Path d="M8 10v7M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></>,
  cake: <><Path d="M4 20h16v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2zM12 11V7" /></>,
};
const Ico = ({ n }) => <Svg viewBox="0 0 24 24" width={9} height={9} style={{ marginRight: 7 }} stroke={C.cy} strokeWidth={1.8} fill="none">{ICON[n]}</Svg>;
const SH = ({ a, b }) => <View style={s.sh}><Text style={s.shT}>{clean(a).toUpperCase()}</Text>{b ? <Text style={[s.shE, { marginLeft: 4 }]}>{clean(b).toUpperCase()}</Text> : null}<View style={s.shL} /></View>;
const H = ({ a, b }) => <View style={s.h}><Text style={s.hT}>{clean(a)}</Text><Text style={s.hE}>// {clean(b).toUpperCase()}</Text></View>;
const Bul = ({ t }) => <View style={s.bl}><View style={s.dot} /><Rich style={s.blT}>{t}</Rich></View>;
const txt = (x) => (typeof x === "string" ? x : x?.text || x?.label || "");

function CvDoc({ d, t, photo, age, short }) {
  return (
    <Document title={`${d.name} - CV`} author={d.name} subject="CV" creator="ademsassi.com">
      <Page size="A4" style={s.page}>
        <View style={s.side}>
          {photo && <View style={s.ring}><Image src={photo} style={s.photo} /></View>}
          <Text style={s.name}>{clean(d.name)}</Text>
          <Text style={s.role}>{clean(d.title).toUpperCase()}</Text>
          <View style={s.bar} />
          <SH a={t.contact} />
          {d.phone ? <View style={s.ct}><Ico n="phone" /><Text style={s.ctT}>{clean(d.phone)}</Text></View> : null}
          {d.email ? <View style={s.ct}><Ico n="mail" /><Link src={"mailto:" + d.email} style={[s.ctT, { textDecoration: "none" }]}>{d.email}</Link></View> : null}
          <View style={s.ct}><Ico n="pin" /><Text style={s.ctT}>{clean(d.location)}</Text></View>
          {d.showAge ? <View style={s.ct}><Ico n="cake" /><Text style={s.ctT}>{age} {t.age}</Text></View> : null}
          <View style={s.ct}><Ico n="web" /><Link src="https://ademsassi.com" style={[s.ctT, { textDecoration: "none" }]}>ademsassi.com</Link></View>
          {d.linkedin ? <View style={s.ct}><Ico n="in" /><Link src={d.linkedin} style={[s.ctT, { textDecoration: "none" }]}>{short(d.linkedin)}</Link></View> : null}

          {d.stack.length > 0 && <SH a={t.stack} b={t.tech} />}
          {d.stack.map((g) => (
            <View key={g.label} wrap={false}>
              <Text style={s.stH}>{clean(g.label).toUpperCase()}</Text>
              <View style={s.tags}>{g.items.map((x) => <Text key={x} style={s.tag}>{clean(x)}</Text>)}</View>
            </View>
          ))}

          {d.langs.length > 0 && <SH a={t.langs} />}
          {d.langs.map((x) => (
            <View key={x.name} style={s.lg}>
              <Text style={s.lgT}>{clean(x.name)}</Text>
              {x.pct > 0
                ? <View style={s.lgBar}><View style={{ width: `${Math.min(100, x.pct)}%`, height: 3.4, borderRadius: 2, backgroundColor: C.cy }} /></View>
                : <Text style={{ fontSize: 7.6, color: C.mute }}>{clean(x.lvl)}</Text>}
            </View>
          ))}

          {d.quals.length > 0 && <SH a={t.quals} />}
          {d.quals.map((x) => <View key={x} style={s.q}><Text style={{ color: C.cy, marginRight: 6 }}>›</Text><Text>{clean(x)}</Text></View>)}
        </View>

        <View style={s.main}>
          {(d.intro || d.objective) ? (
            <View style={s.intro}>
              {d.intro ? <Rich style={s.introT}>{d.intro}</Rich> : null}
              {d.objective ? <Rich style={s.obj} bold={C.cy2}>{d.objective}</Rich> : null}
            </View>
          ) : null}

          {d.exp.length > 0 && <H a={t.exp} b={t.expS} />}
          {d.exp.map((x, i) => (
            <View key={i} style={s.it} wrap={false}>
              <View style={s.itH}><Text style={s.itT}>{clean(x.title)}{x.place ? <Text style={s.itP}> — {clean(x.place)}</Text> : null}</Text><Text style={s.time}>{clean(x.year)}</Text></View>
              {(Array.isArray(x.bullets) ? x.bullets : []).map(txt).filter(Boolean).map((b, j) => <Bul key={j} t={b} />)}
            </View>
          ))}

          {(d.feat || d.others.length > 0) && <H a={t.proj} b={t.projS} />}
          {d.feat ? (
            <View style={s.feat} wrap={false}>
              <View style={s.featH}><Text style={s.featT}>{clean(d.feat.title)}</Text><Text style={s.badge}>{clean(t.feat).toUpperCase()}</Text>{d.feat.linkUrl ? <Link src={d.feat.linkUrl} style={s.featL}>{short(d.feat.linkUrl)}</Link> : null}</View>
              {(Array.isArray(d.feat.bullets) ? d.feat.bullets : []).map(txt).filter(Boolean).map((b, j) => <Bul key={j} t={b} />)}
            </View>
          ) : null}
          {d.others.length > 0 && (
            <View style={s.grid}>
              {d.others.map((p, i) => <View key={i} style={s.cell} wrap={false}><Text style={s.cellT}>{clean(p.title)}</Text><Rich style={s.cellP}>{p.desc}</Rich></View>)}
            </View>
          )}

          {d.edu.length > 0 && <H a={t.edu} b={t.eduS} />}
          {d.edu.map((x, i) => (
            <View key={i} style={s.it} wrap={false}>
              <View style={s.itH}><Text style={s.itT}>{clean(x.title)}{x.place ? <Text style={s.itP}> — {clean(x.place)}</Text> : null}</Text><Text style={s.time}>{clean(x.year)}</Text></View>
              {x.desc ? <Rich style={s.eduP}>{x.desc}</Rich> : null}
            </View>
          ))}
        </View>
        <Text style={s.foot} fixed>{clean(t.updated)} {new Date().toLocaleDateString(t.locale)} · ademsassi.com/cv</Text>
      </Page>
    </Document>
  );
}

async function photoData(url) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    const b = await r.blob();
    return await new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.onerror = () => ok(null); fr.readAsDataURL(b); });
  } catch { return null; }
}

export async function downloadCvPdf({ d, t, age, short, filename }) {
  const photo = await photoData("/photo.jpg?v=" + Date.now());
  const blob = await pdf(<CvDoc d={d} t={t} photo={photo} age={age} short={short} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return blob;
}
