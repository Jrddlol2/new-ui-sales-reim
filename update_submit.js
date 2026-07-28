const fs = require('fs');
let code = fs.readFileSync('src/pages/shared/SubmitClaim.tsx', 'utf8');

code = code.replace(
`  const handleNext = () => setStep(s => Math.min(s + 1, 4));`,
`  const handleNext = () => {
    if (step === 1 && lineItemsLocal.length === 0 && claimType !== 'Cash Advance') {
      addToast('Please add at least one line item', 'error');
      return;
    }
    if (step === 2 && claimType !== 'Cash Advance' && momSource === MinutesSource.TEMPLATE) {
      const activeMomFields = fieldDefinitions.filter(fd => fd.entity === 'mom' && fd.active);
      const missingRequired = activeMomFields.find(fd => fd.required && !momData[fd.key]);
      if (missingRequired) {
        addToast(\`Please fill required field: \${missingRequired.label}\`, 'error');
        return;
      }
    }
    setStep(s => Math.min(s + 1, 4));
  };`
);

fs.writeFileSync('src/pages/shared/SubmitClaim.tsx', code);
