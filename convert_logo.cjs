const fs = require('fs');
try {
    const base64 = fs.readFileSync('src/assets/logo_tat.png').toString('base64');
    fs.writeFileSync('src/utils/logoTatBase64.js', `export const logoTatBase64 = 'data:image/png;base64,${base64}';`);
    console.log('File created successfully');
} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}
