/**
 * Immobilienwertrechner - Sachwertverfahren nach BewG
 * 
 * Implementiert die Anlagen 22, 24, 25 und 36 zum Bewertungsgesetz.
 * Inkl. korrekter Berücksichtigung des 30% Mindestansatzes (§ 190 Abs. 6 BewG).
 */

// Offizielle BMF-Tabelle – Vervielfältiger für Kapitalwert (§ 14 Abs. 1 BewG)
// Quelle: BMF-Schreiben vom 21.10.2025, Az. IV D 4 - S 3104/00002/013/003
// Basis: Allgemeine Sterbetafel 2022/2024 (Destatis, veröff. 22.07.2025), Zinssatz 5,5 %
// Gültig für Bewertungsstichtage ab 1. Januar 2026
// PDF: https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Erbschaft_Schenkungsteuerrecht/2025-10-21-bewert-lebensl-nutzung-leistung-1-1-26.pdf
const bmfDaten = {
    meta: {
        titel: "Kapitalwert einer lebenslänglichen Nutzung oder Leistung im Jahresbetrag von einem Euro",
        stand: "2026 (Sterbetafel 2022/2024)",
        aktenzeichen_bmf: "IV D 4 - S 3104/00002/013/003",
        datum: "21.10.2025",
        quelle: "https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Erbschaft_Schenkungsteuerrecht/2025-10-21-bewert-lebensl-nutzung-leistung-1-1-26.pdf"
    },
    maennlich: {
        // Vollständige offizielle Tabelle (101 Zeilen, Alter 0–100)
        0: 18.402, 1: 18.391, 2: 18.375, 3: 18.359, 4: 18.341,
        5: 18.322, 6: 18.303, 7: 18.282, 8: 18.260, 9: 18.237,
        10: 18.213, 11: 18.187, 12: 18.160, 13: 18.132, 14: 18.101,
        15: 18.070, 16: 18.037, 17: 18.002, 18: 17.965, 19: 17.926,
        20: 17.886, 21: 17.843, 22: 17.799, 23: 17.751, 24: 17.701,
        25: 17.649, 26: 17.593, 27: 17.535, 28: 17.473, 29: 17.409,
        30: 17.340, 31: 17.269, 32: 17.193, 33: 17.113, 34: 17.030,
        35: 16.942, 36: 16.850, 37: 16.753, 38: 16.652, 39: 16.545,
        40: 16.434, 41: 16.317, 42: 16.193, 43: 16.065, 44: 15.930,
        45: 15.788, 46: 15.640, 47: 15.485, 48: 15.323, 49: 15.155,
        50: 14.977, 51: 14.794, 52: 14.605, 53: 14.406, 54: 14.199,
        55: 13.983, 56: 13.762, 57: 13.533, 58: 13.293, 59: 13.048,
        60: 12.798, 61: 12.538, 62: 12.272, 63: 12.002, 64: 11.725,
        65: 11.444, 66: 11.155, 67: 10.860, 68: 10.561, 69: 10.251,
        70: 9.938, 71: 9.619, 72: 9.293, 73: 8.960, 74: 8.627,
        75: 8.282, 76: 7.936, 77: 7.586, 78: 7.230, 79: 6.868,
        80: 6.509, 81: 6.158, 82: 5.798, 83: 5.441, 84: 5.089,
        85: 4.743, 86: 4.411, 87: 4.086, 88: 3.778, 89: 3.496,
        90: 3.234, 91: 2.984, 92: 2.764, 93: 2.566, 94: 2.393,
        95: 2.226, 96: 2.076, 97: 1.951, 98: 1.843, 99: 1.771,
        100: 1.680
    },
    weiblich: {
        // Vollständige offizielle Tabelle (101 Zeilen, Alter 0–100)
        0: 18.465, 1: 18.456, 2: 18.443, 3: 18.430, 4: 18.417,
        5: 18.402, 6: 18.387, 7: 18.371, 8: 18.354, 9: 18.336,
        10: 18.317, 11: 18.297, 12: 18.276, 13: 18.254, 14: 18.230,
        15: 18.206, 16: 18.180, 17: 18.152, 18: 18.124, 19: 18.093,
        20: 18.062, 21: 18.028, 22: 17.992, 23: 17.955, 24: 17.915,
        25: 17.873, 26: 17.829, 27: 17.783, 28: 17.735, 29: 17.683,
        30: 17.629, 31: 17.572, 32: 17.511, 33: 17.448, 34: 17.382,
        35: 17.312, 36: 17.238, 37: 17.160, 38: 17.078, 39: 16.993,
        40: 16.903, 41: 16.808, 42: 16.709, 43: 16.604, 44: 16.494,
        45: 16.379, 46: 16.258, 47: 16.130, 48: 15.997, 49: 15.856,
        50: 15.711, 51: 15.557, 52: 15.398, 53: 15.230, 54: 15.054,
        55: 14.873, 56: 14.680, 57: 14.481, 58: 14.273, 59: 14.058,
        60: 13.832, 61: 13.601, 62: 13.359, 63: 13.108, 64: 12.849,
        65: 12.583, 66: 12.306, 67: 12.020, 68: 11.725, 69: 11.421,
        70: 11.107, 71: 10.780, 72: 10.447, 73: 10.105, 74: 9.754,
        75: 9.393, 76: 9.022, 77: 8.648, 78: 8.271, 79: 7.885,
        80: 7.490, 81: 7.100, 82: 6.703, 83: 6.305, 84: 5.908,
        85: 5.512, 86: 5.133, 87: 4.765, 88: 4.418, 89: 4.086,
        90: 3.770, 91: 3.480, 92: 3.217, 93: 2.975, 94: 2.764,
        95: 2.558, 96: 2.384, 97: 2.226, 98: 2.094, 99: 1.987,
        100: 1.897
    }
};

const anlage36 = [
    { size: 250, factor: 1.24 }, // "< 250" is clamped here
    { size: 300, factor: 1.14 },
    { size: 350, factor: 1.10 },
    { size: 400, factor: 1.06 },
    { size: 450, factor: 1.03 },
    { size: 500, factor: 1.00 },
    { size: 550, factor: 0.98 },
    { size: 600, factor: 0.95 },   // changed from old 0.98
    { size: 650, factor: 0.94 },
    { size: 700, factor: 0.92 },   // changed from old 0.96
    { size: 750, factor: 0.90 },
    { size: 800, factor: 0.89 },   // changed from old 0.94
    { size: 850, factor: 0.87 },
    { size: 900, factor: 0.86 },   // changed from old 0.92
    { size: 950, factor: 0.85 },
    { size: 1000, factor: 0.84 },  // changed from old 0.89
    { size: 1050, factor: 0.83 },
    { size: 1100, factor: 0.82 },
    { size: 1150, factor: 0.81 },
    { size: 1200, factor: 0.80 },  // changed from old 0.85
    { size: 1250, factor: 0.79 },
    { size: 1300, factor: 0.78 },
    { size: 1350, factor: 0.77 },
    { size: 1400, factor: 0.76 },
    { size: 1450, factor: 0.75 },
    { size: 1500, factor: 0.74 },  // changed from old 0.82
    { size: 1550, factor: 0.73 },
    { size: 1600, factor: 0.72 },
    { size: 1650, factor: 0.71 },
    { size: 1700, factor: 0.70 },
    { size: 1750, factor: 0.69 },
    { size: 1800, factor: 0.68 },
    { size: 1850, factor: 0.67 },
    { size: 1900, factor: 0.66 },
    { size: 1950, factor: 0.65 },
    { size: 2000, factor: 0.64 }   // changed from old 0.78
];

const anlage24 = {
    // Keller, Erd- und Obergeschoss (DG ausgebaut), entspricht Tabelle 2 im BewG
    // gnd = Gesamtnutzungsdauer nach Anlage 22 BewG
    "1.11": { 1: 655, 2: 725, 3: 835, 4: 1005, 5: 1260, gnd: 80, label: "1.11 freistehende Einfamilienhäuser (Keller, DG ausgebaut)" },
    "1.111": { 1: 688, 2: 761, 3: 877, 4: 1055, 5: 1323, gnd: 80, label: "1.111 freistehende Zweifamilienhäuser (Keller, DG ausgebaut)" },
    "2.11": { 1: 615, 2: 685, 3: 785, 4: 945, 5: 1180, gnd: 80, label: "2.11 Doppel- und Reihenendhäuser (Keller, DG ausgebaut)" },
    "3.11": { 1: 575, 2: 640, 3: 735, 4: 885, 5: 1105, gnd: 80, label: "3.11 Reihenmittelhäuser (Keller, DG ausgebaut)" },
    // Keller, Erd- und Obergeschoss (DG nicht ausgebaut) -> Flachdach (x.13) wird gemergt
    "1.12": { 1: 570, 2: 635, 3: 730, 4: 880, 5: 1100, gnd: 80, label: "1.12 freistehende Einfamilienhäuser (Keller, DG nicht ausgebaut)" },
    "1.121": { 1: 599, 2: 667, 3: 767, 4: 924, 5: 1155, gnd: 80, label: "1.121 freistehende Zweifamilienhäuser (Keller, DG nicht ausgebaut)" },
    "2.12": { 1: 535, 2: 595, 3: 685, 4: 825, 5: 1035, gnd: 80, label: "2.12 Doppel- und Reihenendhäuser (Keller, DG nicht ausgebaut)" },
    "3.12": { 1: 505, 2: 560, 3: 640, 4: 775, 5: 965, gnd: 80, label: "3.12 Reihenmittelhäuser (Keller, DG nicht ausgebaut)" },
    // Erdgeschoss, nicht unterkellert (DG ausgebaut), entspricht Tabelle 3 im BewG
    "1.21": { 1: 790, 2: 875, 3: 1005, 4: 1215, 5: 1515, gnd: 80, label: "1.21 freistehende Einfamilienhäuser (nicht unterkellert, DG ausgebaut)" },
    "1.211": { 1: 830, 2: 919, 3: 1055, 4: 1276, 5: 1591, gnd: 80, label: "1.211 freistehende Zweifamilienhäuser (nicht unterkellert, DG ausgebaut)" },
    "2.21": { 1: 740, 2: 825, 3: 945, 4: 1140, 5: 1425, gnd: 80, label: "2.21 Doppel- und Reihenendhäuser (nicht unterkellert, DG ausgebaut)" },
    "3.21": { 1: 695, 2: 770, 3: 885, 4: 1065, 5: 1335, gnd: 80, label: "3.21 Reihenmittelhäuser (nicht unterkellert, DG ausgebaut)" },
    // Erdgeschoss, nicht unterkellert (DG nicht ausgebaut)
    "1.22": { 1: 585, 2: 650, 3: 745, 4: 900, 5: 1125, gnd: 80, label: "1.22 freistehende Einfamilienhäuser (nicht unterkellert, DG nicht ausgebaut)" },
    "1.221": { 1: 614, 2: 683, 3: 782, 4: 945, 5: 1181, gnd: 80, label: "1.221 freistehende Zweifamilienhäuser (nicht unterkellert, DG nicht ausgeb.)" },
    "2.22": { 1: 550, 2: 610, 3: 700, 4: 845, 5: 1055, gnd: 80, label: "2.22 Doppel- und Reihenendhäuser (nicht unterkellert, DG nicht ausgebaut)" },
    "3.22": { 1: 515, 2: 570, 3: 655, 4: 790, 5: 990, gnd: 80, label: "3.22 Reihenmittelhäuser (nicht unterkellert, DG nicht ausgebaut)" },
    // Erd- und Obergeschoss, nicht unterkellert (DG ausgebaut), entspricht Tabelle 4 im BewG
    "1.31": { 1: 720, 2: 800, 3: 920, 4: 1105, 5: 1385, gnd: 80, label: "1.31 freistehende Einfamilienhäuser (nicht unt./OG, DG ausgebaut)" },
    "1.311": { 1: 756, 2: 840, 3: 966, 4: 1160, 5: 1454, gnd: 80, label: "1.311 freistehende Zweifamilienhäuser (nicht unt./OG, DG ausgebaut)" },
    "2.31": { 1: 675, 2: 750, 3: 865, 4: 1040, 5: 1300, gnd: 80, label: "2.31 Doppel- und Reihenendhäuser (nicht unt./OG, DG ausgebaut)" },
    "3.31": { 1: 635, 2: 705, 3: 810, 4: 975, 5: 1215, gnd: 80, label: "3.31 Reihenmittelhäuser (nicht unt./OG, DG ausgebaut)" },
    // Erd- und Obergeschoss, nicht unterkellert (DG nicht ausgebaut)
    "1.32": { 1: 620, 2: 690, 3: 790, 4: 955, 5: 1190, gnd: 80, label: "1.32 freistehende Einfamilienhäuser (nicht unt./OG, DG nicht ausgeb.)" },
    "1.321": { 1: 651, 2: 725, 3: 830, 4: 1003, 5: 1250, gnd: 80, label: "1.321 freistehende Zweifamilienhäuser (nicht unt./OG, DG nicht ausgeb.)" },
    "2.32": { 1: 580, 2: 645, 3: 745, 4: 895, 5: 1120, gnd: 80, label: "2.32 Doppel- und Reihenendhäuser (nicht unt./OG, DG nicht ausgeb.)" },
    "3.32": { 1: 545, 2: 605, 3: 695, 4: 840, 5: 1050, gnd: 80, label: "3.32 Reihenmittelhäuser (nicht unt./OG, DG nicht ausgeb.)" },
    // Mehrfamilienhäuser / Mischen
    "4.1": { 1: 650, 2: 720, 3: 825, 4: 985, 5: 1190, gnd: 80, label: "4.1 Mehrfamilienhäuser mit bis zu 6 WE" },
    "4.2": { 1: 600, 2: 665, 3: 765, 4: 915, 5: 1105, gnd: 80, label: "4.2 Mehrfamilienhäuser mit 7 bis 20 WE" },
    "4.3": { 1: 590, 2: 655, 3: 755, 4: 900, 5: 1090, gnd: 80, label: "4.3 Mehrfamilienhäuser mit mehr als 20 WE" },
    "5.1": { 1: 605, 2: 675, 3: 860, 4: 1085, 5: 1375, gnd: 80, label: "5.1 Gemischt genutzte Grundstücke (Wohnhäuser mit Mischnutzung)" },
    // Nebengebäude, Garagen und Werkstätten (GND gem. Anlage 22 BewG: 60 bzw. 50 Jahre)
    "14.1": { 1: 245, 2: 485, 3: 780, 4: 950, 5: 1100, gnd: 60, label: "14.1 Einzelgaragen / Mehrfachgaragen" },
    "15.1": { 1: 685, 2: 850, 3: 1050, 4: 1250, 5: 1430, gnd: 50, label: "15.1 Betriebs- und Werkstätten, eingeschossig" }
};

// Anlage 25: Sachwertfaktoren (Gemäß gesetze-im-internet.de/bewg/anlage_25.html, EFH/ZFH)
// Spalten (x): Bodenrichtwert in €/m²
// Zeilen (y): Vorläufiger Sachwert in Euro
const anlage25 = {
    brw: [30, 60, 120, 180, 250, 350, 500, 1000],
    vsw: [50000, 100000, 150000, 200000, 300000, 400000, 500000],
    matrix: [
        [1.4, 1.5, 1.6, 1.7, 1.7, 1.7, 1.8, 1.8], // 50k
        [1.2, 1.3, 1.4, 1.4, 1.5, 1.5, 1.6, 1.7], // 100k
        [1.0, 1.1, 1.3, 1.3, 1.3, 1.4, 1.5, 1.6], // 150k
        [0.9, 1.0, 1.2, 1.2, 1.3, 1.4, 1.5, 1.6], // 200k
        [0.9, 1.0, 1.1, 1.1, 1.2, 1.3, 1.4, 1.5], // 300k
        [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5], // 400k
        [0.8, 0.9, 1.0, 1.0, 1.1, 1.2, 1.3, 1.4]  // 500k
    ]
};

// --- HILFSFUNKTIONEN ---

const formatCurrency = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
const formatNumber = (val) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(val);

// 1D Interpolation (für Anlage 36) mit Erklär-String
function getUmrechnungskoeffizient(flaeche) {
    if (flaeche < 250) return { factor: 1.24, desc: "Fläche < 250m². Faktor nach Anlage 36 festgesetzt auf Maximum 1.24." };
    if (flaeche >= 2000) return { factor: 0.64, desc: "Fläche >= 2000m². Faktor nach Anlage 36 festgesetzt auf Minimum 0.64." };

    for (let i = 0; i < anlage36.length - 1; i++) {
        let current = anlage36[i];
        let next = anlage36[i + 1];
        if (flaeche >= current.size && flaeche <= next.size) {
            let ratio = (flaeche - current.size) / (next.size - current.size);
            let result = current.factor + ratio * (next.factor - current.factor);

            let desc = `Gemäß § 179 BewG linear interpoliert:\nZwischen ${current.size}m² (F: ${current.factor}) und ${next.size}m² (F: ${next.factor}).\n\nRechnung: ${current.factor} + ((${flaeche} - ${current.size}) / (${next.size} - ${current.size})) * (${next.factor} - ${current.factor}) = ${result.toFixed(3)}`;
            return { factor: result, desc: desc };
        }
    }
    return { factor: 1.00, desc: "Kein passender Bereich gefunden." };
}

// 2D Bilineare Interpolation (für Anlage 25) mit Erklär-String
function getSachwertfaktor(vsw, brw) {
    let { brw: cols, vsw: rows, matrix } = anlage25;

    let isClamped = false;
    let descPrefix = "";

    // Boundary Clamping (Die Matrix darf lt BewG interpoliert, aber nicht extrapoliert werden)
    if (brw < cols[0] || brw > cols[cols.length - 1] || vsw < rows[0] || vsw > rows[rows.length - 1]) {
        isClamped = true;
        descPrefix = "ACHTUNG: Wert überschreitet gesetzliche Tabelle! Anlage 25 wird nicht extrapoliert.\nBerechnung fixiert auf Tabellen-Randwert:\n\n";
    }

    let b = Math.max(cols[0], Math.min(brw, cols[cols.length - 1]));
    let v = Math.max(rows[0], Math.min(vsw, rows[rows.length - 1]));

    let col1 = 0, col2 = 0, row1 = 0, row2 = 0;

    // X-Achse (BRW) Indizes bestimmen
    if (b === cols[cols.length - 1]) { col1 = cols.length - 1; col2 = cols.length - 1; }
    else if (b === cols[0]) { col1 = 0; col2 = 0; }
    else {
        for (let i = 0; i < cols.length - 1; i++) { if (b >= cols[i] && b <= cols[i + 1]) { col1 = i; col2 = i + 1; break; } }
    }

    // Y-Achse (VSW) Indizes bestimmen
    if (v === rows[rows.length - 1]) { row1 = rows.length - 1; row2 = rows.length - 1; }
    else if (v === rows[0]) { row1 = 0; row2 = 0; }
    else {
        for (let i = 0; i < rows.length - 1; i++) { if (v >= rows[i] && v <= rows[i + 1]) { row1 = i; row2 = i + 1; break; } }
    }

    let x1 = cols[col1], x2 = cols[col2];
    let y1 = rows[row1], y2 = rows[row2];

    let q11 = matrix[row1][col1], q12 = matrix[row2][col1];
    let q21 = matrix[row1][col2], q22 = matrix[row2][col2];

    // Edge Cases (Keine Interpolation möglich/nötig, wir klammern auf den Randwert)
    if (x1 === x2 && y1 === y2) return { factor: q11, desc: descPrefix + `Wert fixiert bei BRW ${x1} und VSW ${formatCurrency(y1)}.\n\nFaktor: ${q11.toFixed(3)}` };
    if (x1 === x2) {
        let res = q11 + (v - y1) / (y2 - y1) * (q12 - q11);
        let mathStr = `\n\nRechnung:\n${q11} + ((${formatCurrency(v)} - ${formatCurrency(y1)}) / (${formatCurrency(y2)} - ${formatCurrency(y1)})) * (${q12} - ${q11})`;
        return { factor: res, desc: descPrefix + `1D Interpolation (Nur VSW):\nBRW ist fix auf ${x1} €/m².\nVSW liegt zwischen ${formatCurrency(y1)} und ${formatCurrency(y2)}.${mathStr}\n\nFaktor: ${res.toFixed(3)}` }
    }
    if (y1 === y2) {
        let res = q11 + (b - x1) / (x2 - x1) * (q21 - q11);
        let mathStr = `\n\nRechnung:\n${q11} + ((${b} - ${x1}) / (${x2} - ${x1})) * (${q21} - ${q11})`;
        return { factor: res, desc: descPrefix + `1D Interpolation (Nur BRW):\nVSW ist fix auf ${formatCurrency(y1)}.\nBRW liegt zwischen ${x1} und ${x2} €/m².${mathStr}\n\nFaktor: ${res.toFixed(3)}` }
    }

    // Bilineare Interpolation
    let f_x_y1 = q11 + (b - x1) / (x2 - x1) * (q21 - q11);
    let f_x_y2 = q12 + (b - x1) / (x2 - x1) * (q22 - q12);
    let result = f_x_y1 + (v - y1) / (y2 - y1) * (f_x_y2 - f_x_y1);

    let desc = descPrefix + `Zweidimensionale Lineare Interpolation gem. Anlage 25 BewG:\n`;
    desc += `X (BRW): ${x1} bis ${x2}\nY (VSW): ${formatCurrency(y1)} bis ${formatCurrency(y2)}\n\n`;
    desc += `Schritt 1 (X interpolieren bei unterem Y):\n`;
    desc += `${q11} + ((${b} - ${x1}) / (${x2} - ${x1})) * (${q21} - ${q11}) = ${f_x_y1.toFixed(4)}\n\n`;
    desc += `Schritt 2 (X interpolieren bei oberem Y):\n`;
    desc += `${q12} + ((${b} - ${x1}) / (${x2} - ${x1})) * (${q22} - ${q12}) = ${f_x_y2.toFixed(4)}\n\n`;
    desc += `Schritt 3 (Y interpolieren zwischen 1 und 2):\n`;
    desc += `${f_x_y1.toFixed(4)} + ((${formatCurrency(v)} - ${formatCurrency(y1)}) / (${formatCurrency(y2)} - ${formatCurrency(y1)})) * (${f_x_y2.toFixed(4)} - ${f_x_y1.toFixed(4)})\n\n`;
    desc += `=> Berechneter Faktor: ${result.toFixed(3)}`;

    return { factor: result, desc: desc };
}

// --- HAUPTBERECHNUNG ---

function calculate() {
    // --- Global Inputs ---
    const flaeche = parseFloat(document.getElementById('grundstueck').value) || 0;
    const brw = parseFloat(document.getElementById('brw').value) || 0;
    const evalJahr = parseInt(document.getElementById('bewertungsjahr').value) || 2026;
    const bpi = parseFloat(document.getElementById('bpi').value) || 100;
    const regFaktor = parseFloat(document.getElementById('regionalfaktor').value) || 1.0;

    // --- Schritt 1: Bodenwert ---
    const koeffRes = getUmrechnungskoeffizient(flaeche);
    const bodenwert = flaeche * brw * koeffRes.factor;

    document.getElementById('out-grundstueck').innerText = formatNumber(flaeche);
    document.getElementById('out-brw').innerText = formatNumber(brw);

    const outKoeffEl = document.getElementById('out-koeff');
    outKoeffEl.querySelector('.val-text').innerText = formatNumber(koeffRes.factor);
    document.getElementById('tip-koeff').innerText = koeffRes.desc;

    document.getElementById('res-bodenwert').innerText = formatCurrency(bodenwert);

    // --- Schritt 2 & 3: Multi-Gebäude Loop ---
    const buildingGroups = document.querySelectorAll('.building-group.active');

    let totalGhw = 0;
    let totalGsw = 0;
    let any30PercentRuleActive = false;

    // Containers for dynamic string injection
    const ghwContainer = document.getElementById('ghw-details-container');
    const rndContainer = document.getElementById('rnd-details-container');
    ghwContainer.innerHTML = '';
    rndContainer.innerHTML = '';

    buildingGroups.forEach((group, index) => {
        const bNum = index + 1; // 1, 2, ...
        // Parse ID postfix, assuming elements like gebaeudeart-1, bgf-1 etc or fallback to local query if needed. 
        // Best approach: Query selectors inside the specific group context.
        const gebArtElem = group.querySelector('.geb-select');
        const bgfElem = group.querySelector('input[id^="bgf-"]');
        const baujahrElem = group.querySelector('input[id^="baujahr-"]');
        const standardElem = group.querySelector('input[id^="standard-"], select[id^="standard-"]');

        if (!gebArtElem || !bgfElem || !baujahrElem || !standardElem) return;

        const gebArt = gebArtElem.value;
        const bgf = parseFloat(bgfElem.value) || 0;
        const baujahr = parseInt(baujahrElem.value) || 1950;
        const standardExact = parseFloat(standardElem.value) || 2.0;

        // -> GHW Calc
        const gebTypObjekt = anlage24[gebArt];
        let rhk = 0;
        let tooltipText = '';

        if (gebTypObjekt) {
            // Interpolation der Ausstattungsstufe
            const lowerBound = Math.floor(standardExact);
            const upperBound = Math.ceil(standardExact);

            // Cap bounds between 1 and 5
            const validLower = Math.max(1, Math.min(5, lowerBound));
            const validUpper = Math.max(1, Math.min(5, upperBound));

            const rhkLower = gebTypObjekt[validLower];
            const rhkUpper = gebTypObjekt[validUpper];

            if (validLower === validUpper) {
                rhk = rhkLower;
                tooltipText = `Ermittelt nach Anlage 24 BewG:\nGebäudeart [${gebTypObjekt.label}]\nStandardstufe [${validLower}]\n\nErgibt Basis-Regelherstellungskosten von ${formatNumber(rhk)} €/m² (für fiktives Baujahr 2010).`;
            } else {
                const fraction = standardExact - validLower;
                rhk = rhkLower + fraction * (rhkUpper - rhkLower);
                tooltipText = `Ermittelt nach Anlage 24 BewG durch Interpolation:\nGebäudeart [${gebTypObjekt.label}]\nStufe ${validLower} = ${formatNumber(rhkLower)} €/m²\nStufe ${validUpper} = ${formatNumber(rhkUpper)} €/m²\n\nDelta: ${formatNumber(rhkUpper - rhkLower)} €/m² × ${formatNumber(fraction * 100)}% = ${formatNumber(fraction * (rhkUpper - rhkLower))} €/m² Aufschlag\nErgebnis: ${formatNumber(rhk)} €/m².`;
            }
        } else {
            tooltipText = `Fehler: Gebäudeart '${gebArt}' in Anlage 24 nicht gefunden.`;
        }

        const ghw = bgf * rhk * (bpi / 100) * regFaktor;
        totalGhw += ghw;

        // Determine which table of Anlage 24 it came from (heuristic based on options)
        let anlageTab = "Tab. 2-5";
        if (gebArt.startsWith("1.1") || gebArt.startsWith("2.1") || gebArt.startsWith("3.1")) anlageTab = "Tabelle 2";
        else if (gebArt.startsWith("1.2") || gebArt.startsWith("2.2") || gebArt.startsWith("3.2")) anlageTab = "Tabelle 3";
        else if (gebArt.startsWith("1.3") || gebArt.startsWith("2.3") || gebArt.startsWith("3.3")) anlageTab = "Tabelle 4";

        // Inject HTML
        const regFaktorText = regFaktor !== 1.0 ? ` × ${formatNumber(regFaktor)} (Reg. Faktor)` : '';
        const standardStr = Number.isInteger(standardExact) ? standardExact : formatNumber(standardExact);
        ghwContainer.innerHTML += `
            <div style="margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px dotted rgba(255,255,255,0.1);">
                <div style="font-size: 0.8rem; color: var(--text-muted); padding-left: 0.5rem; margin-bottom: 0.2rem;">
                    <em>Herleitung RHK Haus ${bNum}: Anlage 24 BewG (${anlageTab}) &rarr; Art: ${gebArt} &rarr; Interpolierte Stufe ${standardStr} &rarr; <strong>${formatNumber(rhk)} €/m²</strong></em>
                </div>
                <div class="formula-line" style="margin-bottom: 0; font-size: 0.9em; border-left: 3px solid var(--primary); padding-left: 0.5rem;">
                    <strong>Haus ${bNum}:</strong> ${formatNumber(bgf)} m² BGF ×
                    <span class="val-calc calc-tooltip">
                        <span class="val-text">${formatNumber(rhk)}</span> €/m²
                        <span class="tooltip-box math-tooltip">${tooltipText}</span>
                    </span>
                    <a href="https://www.gesetze-im-internet.de/bewg/anlage_24.html" target="_blank"
                        class="gesetz-link">(Anlage 24)</a> ×
                    (${formatNumber(bpi)}% BPI)${regFaktorText}
                    <span style="float: right; color: var(--text-dark);"><strong>${formatCurrency(ghw)}</strong></span>
                </div>
            </div>
        `;

        // -> RND / GSW Calc (GND dynamisch aus Anlage 22 BewG pro Gebäudeart)
        const gnd = gebTypObjekt ? (gebTypObjekt.gnd || 80) : 80;
        let alter = Math.max(0, evalJahr - baujahr);
        let rnd = Math.max(0, gnd - alter);

        let gebSacherwertLinear = ghw * (rnd / gnd);
        let minGebSachwert = ghw * 0.3;
        let finalGebSachwert = Math.max(gebSacherwertLinear, minGebSachwert);

        if (minGebSachwert > gebSacherwertLinear) {
            any30PercentRuleActive = true;
        }

        totalGsw += finalGebSachwert;

        const is30Tag = (minGebSachwert > gebSacherwertLinear) ? `<span style="color:var(--warning); font-size:0.8em; margin-left:8px;">(30%-Kappung!)</span>` : '';

        // Inject HTML
        rndContainer.innerHTML += `
            <div class="formula-line" style="margin-bottom: 0.2rem; font-size: 0.9em; border-left: 3px solid var(--secondary); padding-left: 0.5rem;">
                <strong>Haus ${bNum}:</strong> Alter: <span class="val-calc">${alter}</span> J. ➔ RND: <span class="val-calc">${rnd}</span> / 80
                <br><span style="color:var(--text-light); font-size: 0.85em;">(${formatCurrency(ghw)} GHW × (${rnd}/80)) ${is30Tag}</span>
                <span style="float: right; color: var(--text-dark);"><strong>${formatCurrency(finalGebSachwert)}</strong></span>
            </div>
        `;
    });

    // Update Totals Blocks
    document.getElementById('res-ghw').innerText = formatCurrency(totalGhw);
    document.getElementById('rule-30-warning').style.display = any30PercentRuleActive ? 'inline-flex' : 'none';
    document.getElementById('res-gsw').innerText = formatCurrency(totalGsw);


    // --- Schritt 4: Vorläufiger Sachwert ---
    const vorlSachwert = bodenwert + totalGsw;
    document.getElementById('res-vsw').innerText = formatCurrency(vorlSachwert);

    // --- Schritt 5: Marktanpassung ---
    const wertzahlRes = getSachwertfaktor(vorlSachwert, brw);
    const finalSachwert = vorlSachwert * wertzahlRes.factor;

    document.getElementById('out-wertzahl').innerText = formatNumber(wertzahlRes.factor);
    document.getElementById('tip-wertzahl').innerText = wertzahlRes.desc;

    document.getElementById('res-final').innerText = formatCurrency(finalSachwert);

    // Update Summary Dashboard
    document.getElementById('sum-modul-1').innerText = formatCurrency(finalSachwert);

    // Kaskade: Wenn der Immobilienwert berechnet wurde, trage ihn in Module 2 und 3 als Referenz ein
    document.getElementById('wohn-immo-wert').value = finalSachwert.toFixed(0);
    const immoGesamtEl = document.getElementById('out-steuer-immo-gesamt');
    immoGesamtEl.innerText = formatNumber(finalSachwert);
    immoGesamtEl.setAttribute('data-raw-value', finalSachwert);

    // Auto-Trigger Folge-Module
    // Dies stößt die Kaskade an: calculateWohnrecht -> calculateSteuer -> calculateNotarkosten (mit dem korrekten %-Anteil)
    calculateWohnrecht();
}

// --- MODUL 2: WOHNRECHT ---
function getVervielfaeltiger(alter, geschlecht) {
    // BMF-Tabelle ist als Konstante eingebettet und immer verfügbar.

    const geschlechtKey = geschlecht === 'm' ? 'maennlich' : 'weiblich';
    const tabelle = bmfDaten[geschlechtKey];

    // 2. Exact Match in der JSON Tabelle
    if (tabelle[alter.toString()] !== undefined) {
        let value = tabelle[alter.toString()];
        let desc = `Offizieller BMF-Sterbetafel-Wert (§ 14 BewG)\nStand: ${bmfDaten.meta.stand}\nAktenzeichen: ${bmfDaten.meta.aktenzeichen_bmf}\n\nGeschlecht: ${geschlecht === 'm' ? 'Männlich' : 'Weiblich'}\nVollendetes Alter: ${alter} Jahre\nFestgesetzter Vervielfältiger: ${value.toFixed(3)}`;
        return { factor: value, desc: desc };
    }

    // 3. Interpolation, falls Alter nicht exakt in JSON hinterlegt ist
    let lowerAge = -1;
    let upperAge = 999;

    // Finde den nächstkleineren und nächstgrößeren hinterlegten Wert
    const ages = Object.keys(tabelle).map(Number).sort((a, b) => a - b);
    for (let i = 0; i < ages.length; i++) {
        if (ages[i] < alter) lowerAge = ages[i];
        if (ages[i] > alter && upperAge === 999) upperAge = ages[i];
    }

    // Edge Cases: Alter außerhalb der Tabelle
    if (lowerAge === -1) lowerAge = ages[0];
    if (upperAge === 999) upperAge = ages[ages.length - 1];

    let valLower = tabelle[lowerAge.toString()];
    let valUpper = tabelle[upperAge.toString()];

    // Lineare Interpolation zwischen lowerAge und upperAge
    let altersDifferenz = upperAge - lowerAge;
    let wertDifferenz = valUpper - valLower; // Normalerweise negativ, da Wert sinkt
    let interpoliert = valLower + (wertDifferenz / altersDifferenz) * (alter - lowerAge);

    let descInterpol = `Interpolierter Wert (Fehlt in der JSON Tabelle).\nInterpoliert zwischen Alter ${lowerAge} (${valLower.toFixed(3)}) und Alter ${upperAge} (${valUpper.toFixed(3)}).\n\nEmpfehlung: Trage das Alter ${alter} manuell in die bmf_tabelle_2025.json ein für 100% juristische Genauigkeit.`;

    return { factor: interpoliert, desc: descInterpol };
}

function calculateWohnrecht() {
    const rechtArt = document.getElementById('wohn-recht-art').value;
    const alter = parseInt(document.getElementById('wohn-alter').value) || 0;
    const geschlecht = document.getElementById('wohn-geschlecht').value;
    const immoWert = parseFloat(document.getElementById('wohn-immo-wert').value) || 0;

    let jahreswert = 0;
    let textOut1 = "";

    // Schritt 1: Jahreswert
    if (rechtArt === 'wohnrecht') {
        const flaeche = parseFloat(document.getElementById('wohn-flaeche').value) || 0;
        const miete = parseFloat(document.getElementById('wohn-miete').value) || 0;
        jahreswert = flaeche * miete * 12;
        textOut1 = `<span class="val-input">${formatNumber(flaeche)}</span> m² × <span class="val-input">${formatNumber(miete)}</span> € × 12 Monate`;
    } else {
        const monatsertrag = parseFloat(document.getElementById('wohn-monatsertrag').value) || 0;
        jahreswert = monatsertrag * 12;
        textOut1 = `<span class="val-input">${formatNumber(monatsertrag)}</span> € Reinertrag × 12 Monate`;
    }

    const formulaContainer1 = document.getElementById('res-wohn-jahreswert').parentElement.previousElementSibling;
    if (formulaContainer1 && formulaContainer1.classList.contains('formula-line')) {
        formulaContainer1.innerHTML = textOut1;
    }

    document.getElementById('res-wohn-jahreswert').innerText = formatCurrency(jahreswert);

    // Schritt 2: Kappungsgrenze § 16 BewG
    let kappung = 0;
    let isKapped = false;
    let massgeblich = jahreswert;

    if (immoWert > 0) {
        kappung = immoWert / 18.6;
        document.getElementById('out-wohn-kappung Grenze').innerText = formatCurrency(kappung);
        if (jahreswert > kappung) {
            massgeblich = kappung;
            isKapped = true;
        }
    } else {
        document.getElementById('out-wohn-kappung Grenze').innerText = "0 € (Kein Immo-Wert definiert)";
    }

    document.getElementById('wohn-kappung-warning').style.display = isKapped ? 'block' : 'none';
    document.getElementById('res-wohn-massgeblich').innerText = formatCurrency(massgeblich);

    // Schritt 3: Kapitalwert
    const vervRes = getVervielfaeltiger(alter, geschlecht);
    const faktor = parseFloat(vervRes.factor);
    const kapitalwert = massgeblich * faktor;

    document.getElementById('out-wohn-faktor').innerText = faktor.toFixed(3);
    document.getElementById('tip-wohn-faktor').innerText = vervRes.desc;
    document.getElementById('res-wohn-kapitalwert').innerText = formatCurrency(kapitalwert);
    document.getElementById('res-wohn-kapitalwert').setAttribute('data-raw-value', kapitalwert);

    // Update Summary Dashboard
    document.getElementById('sum-modul-2').innerText = formatCurrency(kapitalwert);

    // Kaskade: Auto-Trigger Modul 3
    calculateSteuer(immoWert, kapitalwert);
}

// --- MODUL 3: SCHENKUNGSSTEUER ---
function getSteuerSatz(klasse, erwerb) {
    if (erwerb <= 0) return 0;

    let satz = 0;
    if (klasse === "1") {
        if (erwerb <= 75000) satz = 7;
        else if (erwerb <= 300000) satz = 11;
        else if (erwerb <= 600000) satz = 15;
        else if (erwerb <= 6000000) satz = 19;
        else if (erwerb <= 13000000) satz = 23;
        else if (erwerb <= 26000000) satz = 27;
        else satz = 30;
    } else if (klasse === "2") {
        if (erwerb <= 75000) satz = 15;
        else if (erwerb <= 300000) satz = 20;
        else if (erwerb <= 600000) satz = 25;
        else if (erwerb <= 6000000) satz = 30;
        else if (erwerb <= 13000000) satz = 35;
        else if (erwerb <= 26000000) satz = 40;
        else satz = 43;
    } else { // Klasse 3 (§ 19 Abs. 1 ErbStG)
        if (erwerb <= 75000) satz = 30;
        else if (erwerb <= 300000) satz = 30;
        else if (erwerb <= 600000) satz = 30;
        else if (erwerb <= 6000000) satz = 30;
        else if (erwerb <= 13000000) satz = 50;
        else if (erwerb <= 26000000) satz = 50;
        else satz = 50;
    }
    return satz;
}

function calculateSteuer() {
    // Werte direkt aus dem DOM holen, damit Modul 3 auch Standalone getriggert werden kann
    const selectVerwandtschaft = document.getElementById('steuer-verwandtschaft');
    const selectedOption = selectVerwandtschaft.options[selectVerwandtschaft.selectedIndex];

    // Ermittlung der Steuerklasse (ErbStG § 15)
    const optGroupLabel = selectedOption.parentElement.label;
    let klasse = "3";
    if (optGroupLabel.includes("I")) klasse = "1";
    if (optGroupLabel.includes("II")) klasse = "2";

    const freibetrag = parseFloat(selectedOption.getAttribute('data-freibetrag')) || 0;
    const anteilProzent = parseFloat(document.getElementById('steuer-immo-anteil').value) || 100;

    const gesamtImmoWert = parseFloat(document.getElementById('out-steuer-immo-gesamt').getAttribute('data-raw-value')) || 0;
    const gesamtWohnrecht = parseFloat(document.getElementById('res-wohn-kapitalwert').getAttribute('data-raw-value')) || 0;
    const isWohnrechtVoll = document.getElementById('steuer-wohnrecht-voll').checked;

    const immoAnteilig = gesamtImmoWert * (anteilProzent / 100);
    // Wenn Checkbox aktiv: 100% Abzug. Sonst: Anteiliger Abzug gemäß Immobilien-Quote
    const wohnrechtAbzug = isWohnrechtVoll ? gesamtWohnrecht : (gesamtWohnrecht * (anteilProzent / 100));

    const bereicherung = immoAnteilig - wohnrechtAbzug;
    const steuerpflichtig = Math.max(0, bereicherung - freibetrag);

    // UI Updates Schritt 1
    document.getElementById('out-steuer-immo-anteilig').innerText = formatCurrency(immoAnteilig);
    document.getElementById('out-steuer-wohnrecht').innerText = formatCurrency(wohnrechtAbzug);

    // Anzuzeigender Prozentsatz für die Transparenz
    const prozentAnzeige = isWohnrechtVoll ? 100 : anteilProzent;
    const divProzentText = document.getElementById('out-steuer-wohnrecht-prozent');
    if (divProzentText) {
        divProzentText.innerText = `(${prozentAnzeige} %)`;
    }

    document.getElementById('out-steuer-freibetrag').innerText = formatCurrency(freibetrag);
    document.getElementById('res-steuer-bereicherung').innerText = formatCurrency(steuerpflichtig);

    // UI Updates Schritt 2
    const steuerSatz = getSteuerSatz(klasse, steuerpflichtig);
    const steuerlast = steuerpflichtig * (steuerSatz / 100);

    document.getElementById('out-steuer-satz').innerText = steuerSatz + " % (Klasse " + klasse + ")";
    document.getElementById('res-steuer-last').innerText = formatCurrency(steuerlast);

    // Update Summary Dashboard
    document.getElementById('sum-modul-3').innerText = formatCurrency(steuerlast);

    // Kaskade: Wenn nur ein Immobilien-Anteil übertragen wird, ist dieser Anteil der "Geschäftswert" für den Notar
    document.getElementById('notar-geschaeftswert').value = immoAnteilig.toFixed(0);
    calculateNotarkosten(immoAnteilig);
}

// --- Modul 4: Notarkosten (GNotKG) ---
// Tabelle B (Anlage 2 zu § 34 Abs. 3 GNotKG, Fassung 01.01.2021)
// Quelle: https://www.gesetze-im-internet.de/gnotkg/anlage_2.html
const tabelleB = [
    [500, 15], [2000, 27], [10000, 75], [25000, 115], [50000, 165],
    [100000, 273], [200000, 435], [500000, 935], [1000000, 1735],
    [2000000, 3335], [3000000, 4935], [5000000, 8135],
    [10000000, 16135], [15000000, 24135], [20000000, 32135],
    [25000000, 40135], [30000000, 48135]
];

function getNotarBasisgebuehr(wert) {
    // Implementiert Anlage 2 zu § 34 Abs. 3 GNotKG (Tabelle B)
    if (wert <= 0) return 0;
    if (wert <= tabelleB[0][0]) return tabelleB[0][1];
    if (wert >= tabelleB[tabelleB.length - 1][0]) return tabelleB[tabelleB.length - 1][1];

    // Finde die passende Stufe und interpoliere linear
    for (let i = 0; i < tabelleB.length - 1; i++) {
        const [wertUnten, gebUnten] = tabelleB[i];
        const [wertOben, gebOben] = tabelleB[i + 1];
        if (wert > wertUnten && wert <= wertOben) {
            // Lineare Interpolation zwischen den Stützstellen
            const ratio = (wert - wertUnten) / (wertOben - wertUnten);
            return gebUnten + ratio * (gebOben - gebUnten);
        }
    }
    return tabelleB[tabelleB.length - 1][1]; // Fallback
}

function calculateNotarkosten(importedGeschaeftsWert = 0) {
    let geschaeftsWert = importedGeschaeftsWert;

    // Wenn 0 übergeben (Standalone-Aufruf der Funktion), lies aus DOM aus
    if (geschaeftsWert === 0) {
        geschaeftsWert = parseFloat(document.getElementById('notar-geschaeftswert').value) || 0;
    } else {
        document.getElementById('notar-geschaeftswert').value = geschaeftsWert.toFixed(0);
    }

    const hasVollzug = document.getElementById('notar-vollzug').checked;
    const hasGrundbuch = document.getElementById('notar-grundbuch').checked;

    // 1,0 Basisgebühr errechnen
    const basisGebuehr = getNotarBasisgebuehr(geschaeftsWert);
    document.getElementById('out-notar-basis').innerText = formatCurrency(basisGebuehr);

    // Beurkundung einer Schenkung löst in der Regel eine 2,0 Gebühr aus
    const beurkundungGebuehr = basisGebuehr * 2.0;
    document.getElementById('out-notar-beurkundung').innerText = formatCurrency(beurkundungGebuehr);

    // Optionale Gebühren (je 0,5 der Basisgebühr)
    const vollzugGebuehr = hasVollzug ? (basisGebuehr * 0.5) : 0;
    const grundbuchGebuehr = hasGrundbuch ? (basisGebuehr * 0.5) : 0;

    document.getElementById('out-notar-vollzug-val').innerText = formatCurrency(vollzugGebuehr);
    document.getElementById('row-notar-vollzug').style.opacity = hasVollzug ? 1.0 : 0.4;

    document.getElementById('out-notar-grundbuch-val').innerText = formatCurrency(grundbuchGebuehr);
    document.getElementById('row-notar-grundbuch').style.opacity = hasGrundbuch ? 1.0 : 0.4;

    // Netto Zwischensumme
    const nettoSumme = beurkundungGebuehr + vollzugGebuehr + grundbuchGebuehr;

    // Post- und Telekommunikationspauschale (KV 32001 GNotKG): 20% der Gebühren, max. 20 €
    const nettoNotar = beurkundungGebuehr + vollzugGebuehr;
    const auslagen = Math.min(20.0, nettoNotar * 0.20);
    document.getElementById('out-notar-auslagen').innerText = formatCurrency(auslagen);

    // Umsatzsteuer 19 % (Auf Notarkosten + Auslagen. Grundbuchamt ist USt-frei!)
    const mwstPflichtig = nettoNotar + auslagen;
    const ust = mwstPflichtig * 0.19;
    document.getElementById('out-notar-ust').innerText = formatCurrency(ust);

    // Finale Summe
    const bruttoGesamt = nettoSumme + auslagen + ust;
    document.getElementById('res-notar-gesamt').innerText = formatCurrency(bruttoGesamt);

    // Update Summary Dashboard
    document.getElementById('sum-modul-4').innerText = formatCurrency(bruttoGesamt);
}

// --- Modul 1: UI Toggle für Nebengebäude ---
let buildingCount = 1;
const building2Group = document.getElementById('building-2-group');
const addBuildingBtn = document.getElementById('add-building-btn');
const removeBuildingBtn = document.getElementById('remove-building-btn');

function addBuilding() {
    if (building2Group) {
        building2Group.style.display = 'block';
        building2Group.classList.add('active');
        if (addBuildingBtn) addBuildingBtn.style.display = 'none';
        buildingCount = 2;
        calculate();
    }
}

function removeBuilding() {
    if (building2Group) {
        building2Group.style.display = 'none';
        building2Group.classList.remove('active');
        if (addBuildingBtn) addBuildingBtn.style.display = 'block';

        // Reset inputs for building 2
        document.getElementById('bgf-2').value = '';
        document.getElementById('baujahr-2').value = '';
        document.getElementById('standard-2').value = '2.0';

        buildingCount = 1;
        calculate();
    }
}

if (addBuildingBtn) addBuildingBtn.addEventListener('click', addBuilding);
if (removeBuildingBtn) removeBuildingBtn.addEventListener('click', removeBuilding);

// Global Event Listeners für alle Module
document.querySelectorAll('input:not([type="checkbox"]), select').forEach(el => {
    el.addEventListener('input', (e) => {
        // UI Toggle für Wohnrecht vs Nießbrauch
        if (e.target.id === 'wohn-recht-art') {
            const isNießbrauch = e.target.value === 'niessbrauch';
            document.getElementById('inputs-wohnrecht').style.display = isNießbrauch ? 'none' : 'flex';
            document.getElementById('inputs-niessbrauch').style.display = isNießbrauch ? 'block' : 'none';
        }

        // Starte Kaskade je nach dem, wo sich was ändert
        if (e.target.closest('#modul-wohnrecht')) {
            calculateWohnrecht();
        } else if (e.target.closest('#modul-steuer')) {
            calculateSteuer();
        } else if (e.target.closest('#modul-notar')) {
            calculateNotarkosten();
        } else {
            calculate(); // Modul 1 triggert automatisch 2, 3 und 4
        }
    });
});

// Checkboxen separat mit 'change' Event (F-13)
document.querySelectorAll('input[type="checkbox"]').forEach(el => {
    el.addEventListener('change', (e) => {
        if (e.target.closest('#modul-steuer')) {
            calculateSteuer();
        } else if (e.target.closest('#modul-notar')) {
            calculateNotarkosten();
        } else {
        }
    });
});

document.getElementById('calc-btn').addEventListener('click', calculate);

// --- SAVE AND LOAD DATA ---
const btnSaveData = document.getElementById('btn-save-data');
const btnLoadData = document.getElementById('btn-load-data');
const fileLoadData = document.getElementById('file-load-data');

if (btnSaveData) {
    btnSaveData.addEventListener('click', () => {
        const data = {};
        // Select all inputs and selects except the hidden file input
        const inputs = document.querySelectorAll('input:not([type="file"]), select');
        inputs.forEach(input => {
            if (input.id) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    data[input.id] = input.checked;
                } else {
                    data[input.id] = input.value;
                }
            }
        });

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        const dateStr = new Date().toISOString().split('T')[0];
        downloadAnchorNode.setAttribute("download", "immobilienbewertung_" + dateStr + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });
}

if (btnLoadData && fileLoadData) {
    btnLoadData.addEventListener('click', () => fileLoadData.click());

    fileLoadData.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Ensure correct number of building groups exist based on data keys
                const bgfKeys = Object.keys(data).filter(k => k.startsWith('bgf-'));
                const maxIdArr = bgfKeys.map(k => parseInt(k.replace('bgf-', '')));
                const maxBuildingIdNeeded = maxIdArr.length ? Math.max(...maxIdArr) : 1;

                while (typeof addBuilding === 'function' && typeof buildingCount !== 'undefined' && buildingCount < maxBuildingIdNeeded) {
                    addBuilding();
                }

                // Populate values into DOM safely
                Object.keys(data).forEach(key => {
                    try {
                        const el = document.getElementById(key);
                        if (el) {
                            if (el.type === 'checkbox' || el.type === 'radio') {
                                el.checked = data[key];
                            } else if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
                                el.value = data[key];
                            }
                        }
                    } catch (e) { console.warn('Could not set: ' + key); }
                });

                // Trigger correct UI state safely
                try {
                    const rechtArtEl = document.getElementById('wohn-recht-art');
                    if (rechtArtEl) {
                        const isNiessbrauch = rechtArtEl.value === 'niessbrauch';
                        const elWohn = document.getElementById('inputs-wohnrecht');
                        const elNiess = document.getElementById('inputs-niessbrauch');
                        if (elWohn) elWohn.style.display = isNiessbrauch ? 'none' : 'flex';
                        if (elNiess) elNiess.style.display = isNiessbrauch ? 'block' : 'none';
                    }
                } catch (e) { console.warn('UI Toggle Error'); }

                try { calculate(); } catch (e) { console.warn('Calculate Error on load', e); }

                fileLoadData.value = "";
                alert("Daten erfolgreich geladen.");
            } catch (err) {
                alert("Fehler beim Verarbeiten der Datei (" + err.message + ")");
                console.error(err);
            }
        };
        reader.readAsText(file);
    });
}

// Initial Load
calculate();
