const CLASS_INFO = {
  "テルペン類": { color:"#2e7d32", light:"#e8f5e9" },
  "エステル類": { color:"#ef6c00", light:"#fff3e0" },
  "アルデヒド類": { color:"#9a7600", light:"#fff8d8" },
  "ケトン類": { color:"#c62828", light:"#ffebee" },
  "アルコール類": { color:"#1565c0", light:"#e3f2fd" },
  "フェノール類": { color:"#6a1b9a", light:"#f3e5f5" },
  "含硫化合物": { color:"#455a64", light:"#eceff1" },
  "その他": { color:"#795548", light:"#efebe9" }
};

const S = {
  c: [],
  mode: "learn",
  q: [],
  i: 0,
  stage: 0,
  score: 0,
  totalSteps: 0,
  miss: [],
  answered: false,
  stats: JSON.parse(localStorage.getItem("aromaStats") || "{}")
};