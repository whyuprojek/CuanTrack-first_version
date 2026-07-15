const fs = require('fs');
let code = fs.readFileSync('handlers/budget.js', 'utf8');

code = code.replace(
  "try {\n       await saveToBudgetStoreAndSheets(userId, categoryName, amount);\n     } catch (err) {",
  "try {\n       await sheets.setSpendingBudget(user.spreadsheetId, categoryName, amount);\n     } catch (err) {"
);

fs.writeFileSync('handlers/budget.js', code);
