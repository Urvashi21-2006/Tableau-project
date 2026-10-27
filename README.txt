# Health360 Dashboard Website

A beginner-friendly static website inspired by the Tableau workbook you shared. It uses the same healthcare fields found in the workbook, including age, gender, BMI, cholesterol, heart disease, diabetes and health risk score.

## Files
- `index.html` — page structure
- `style.css` — layout and styling
- `script.js` — charts, filters, CSV parsing and calculations

## Run it
1. Extract the ZIP file.
2. Open `index.html` in Chrome or Edge.
3. Click **Upload CSV** and select your original `smart_healthcare_dataset.csv`.
4. Use the Gender and Age group filters to explore the dashboard.

The first view uses randomly generated demo data so the charts are visible immediately. It is not your real dataset. Upload your CSV to show actual values. The CSV should include columns such as `age`, `gender`, `cholesterol`, `heart_disease`, `diabetes`, and `health_risk_score`. Other fields can be present too.

This is a front-end website; it does not need a server. Google Fonts are optional and require an internet connection. Charts are drawn using built-in SVG, so no chart library is needed.

## Important
This is an educational data-visualization project, not a medical tool or diagnosis.
